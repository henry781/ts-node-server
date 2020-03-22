import {Token} from 'auth-header';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {Request} from '../types';
import {BasicAuthProvider} from './BasicAuthProvider';
import {Principal} from './Principal';

describe('BasicAuthProvider', () => {

    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.restore();
    });

    /**
     * Authenticate
     */
    describe('authenticate', () => {

        it('should throw an error when token is not defined', async () => {

            const provider = new BasicAuthProvider({
                user1: {
                    password: 'pass',
                },
            });

            try {
                await provider.authenticate({} as Request, undefined, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Basic auth: authorization scheme should be \'basic\'');
            }
        });

        it('should throw an error when token scheme is not basic', async () => {

            const provider = new BasicAuthProvider({
                user1: {
                    password: 'pass',
                },
            });
            const token: Token = {
                params: undefined,
                scheme: 'bearer',
                token: 'dGVzdDpkZW1v',
            };

            try {
                await provider.authenticate({} as Request, token, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Basic auth: authorization scheme should be \'basic\'');
            }
        });

        it('should throw an error when user is not defined', async () => {

            const provider = new BasicAuthProvider({
                user1: {
                    password: 'pass',
                },
            });
            const token: Token = {
                params: undefined,
                scheme: 'basic',
                token: 'dGVzdDpkZW1v',
            };

            try {
                await provider.authenticate({} as Request, token, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Basic auth: bad credentials');
            }
        });

        it('should throw an error when password is not ok', async () => {

            const provider = new BasicAuthProvider({
                user1: {
                    password: 'pass',
                },
            });
            const token: Token = {
                params: undefined,
                scheme: 'basic',
                token: 'dXNlcjE6aW52YWxpZA==',
            };

            try {
                await provider.authenticate({} as Request, token, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Basic auth: bad credentials');
            }
        });

        it('should throw an error when token is invalid', async () => {

            const provider = new BasicAuthProvider({
                user1: {
                    password: 'pass',
                },
            });
            const token: Token = {
                params: undefined,
                scheme: 'basic',
                token: 'dXNlcjFhbGlk',
            };

            try {
                await provider.authenticate({} as Request, token, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Basic auth: bad credentials');
            }
        });

        it('should not throw an error when everything is ok', async () => {

            const provider = new BasicAuthProvider({
                user1: {
                    password: 'pass',
                },
            });
            const token: Token = {
                params: undefined,
                scheme: 'basic',
                token: 'dXNlcjE6cGFzcw==',
            };

            await provider.authenticate({} as Request, token, {});
        });

        it('should return authenticated user', async () => {

            const userOptions = {
                password: 'pass',
            };
            const provider = new BasicAuthProvider({
                user1: userOptions,
            });
            const token: Token = {
                params: undefined,
                scheme: 'basic',
                token: 'dXNlcjE6cGFzcw==',
            };

            const user = new Principal({
                login: 'user1',
            });
            sandbox.stub(provider, 'provideUser')
                .withArgs('user1', userOptions, token)
                .returns(user);

            const actualUser = await provider.authenticate({} as Request, token, {});
            chai.expect(actualUser).equal(user);
        });
    });
});

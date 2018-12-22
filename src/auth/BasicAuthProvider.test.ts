import {Token} from 'auth-header';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {BasicAuthProvider} from './BasicAuthProvider';
import {Principal} from './Principal';

describe('BasicAuthProvider', () => {

    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.restore();
    });

    /**
     * Get scheme
     */
    describe('getScheme', () => {

        it('should return basic', () => {
            const provider = new BasicAuthProvider();
            chai.expect(provider.getScheme()).equal('basic');
        });
    });

    /**
     * Authenticate
     */
    describe('authenticate', () => {

        it('should throw an error when user is not defined', () => {

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

            chai.expect(() => provider.authenticate(token, {}))
                .to.throw('bad credentials');
        });

        it('should throw an error when password is not ok', () => {

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

            chai.expect(() => provider.authenticate(token, {}))
                .to.throw('bad credentials');
        });

        it('should throw an error when token is invalid', () => {

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

            chai.expect(() => provider.authenticate(token, {}))
                .to.throw('bad credentials');

        });

        it('should not throw an error when everything is ok', () => {

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

            provider.authenticate(token, {});
        });

        it('should return authenticated user', () => {

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

            const actualUser = provider.authenticate(token, {});
            chai.expect(actualUser).equal(user);
        });
    });
});

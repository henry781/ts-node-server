import {Token} from 'auth-header';
import * as chai from 'chai';
import * as jwt from 'jsonwebtoken';
import * as sinon from 'sinon';
import {Request} from '../types';
import {JwtAuthProvider} from './JwtAuthProvider';
import {Principal} from './Principal';

describe('JwtAuthProvider', () => {

    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.restore();
    });

    /**
     * Authenticate
     */
    describe('authenticate', () => {

        it('should throw an error when token is not defined', async () => {

            const provider = new JwtAuthProvider({
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate: 'CERT',
            });

            try {
                await provider.authenticate({} as Request, undefined, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Authorization header is missing');
            }
        });

        it('should throw an error when token scheme is not bearer', async () => {

            const provider = new JwtAuthProvider({
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate: 'CERT',
            });
            const token: Token = {
                params: undefined,
                scheme: 'basic',
                token: '1234567890',
            };

            try {
                await provider.authenticate({} as Request, token, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Authorization scheme should be \'bearer\'');
            }
        });

        it('should throw an error when verify throw an error', async () => {

            const provider = new JwtAuthProvider({
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate: 'CERT',
            });
            const token: Token = {
                params: undefined,
                scheme: 'bearer',
                token: '1234567890',
            };

            sandbox.stub(jwt, 'verify')
                .withArgs('1234567890', '-----BEGIN CERTIFICATE-----\nCERT\n-----END CERTIFICATE-----')
                .throws(new Error('Token expired'));

            try {
                await provider.authenticate({} as Request, token, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Token expired');
            }
        });

        it('should not throw an error when everything is ok', async () => {

            const provider = new JwtAuthProvider({
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate: 'CERT',
            });
            const token: Token = {
                params: undefined,
                scheme: 'bearer',
                token: '1234567890',
            };

            sandbox.stub(jwt, 'verify')
                .withArgs('1234567890', '-----BEGIN CERTIFICATE-----\nCERT\n-----END CERTIFICATE-----')
                .returns({} as any);

            await provider.authenticate({} as Request, token, {});
        });

        it('should return authenticated user', async () => {

            const provider = new JwtAuthProvider({
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate: 'CERT',
            });
            const token: Token = {
                params: undefined,
                scheme: 'bearer',
                token: '1234567890',
            };
            const decodedToken = {
                preferred_username: 'user1',
            };

            sandbox.stub(jwt, 'verify')
                .withArgs('1234567890', '-----BEGIN CERTIFICATE-----\nCERT\n-----END CERTIFICATE-----')
                .returns(decodedToken as any);

            const user = new Principal({
                login: 'user1',
            });
            sandbox.stub(provider, 'provideUser')
                .withArgs(decodedToken, token)
                .returns(user);

            const actualUser = await provider.authenticate({} as Request, token, {});
            chai.expect(actualUser).equal(user);
        });
    });
});

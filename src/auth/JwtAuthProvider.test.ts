import {Token} from 'auth-header';
import * as chai from 'chai';
import * as crypto from 'crypto';
import * as jose from 'jose';
import rewiremock from 'rewiremock/node';
import * as sinon from 'sinon';
import {URL} from 'url';
import {Request} from '../types';
import {Principal} from './Principal';

describe('JwtAuthProvider', async () => {

    const sandbox = sinon.createSandbox();

    const createPublicKeyStub = sandbox.stub(crypto, 'createPublicKey');
    const jwtVerifyStub = sandbox.stub(jose, 'jwtVerify');
    const createRemoteJWKSetStub = sandbox.stub(jose, 'createRemoteJWKSet');
    const m = rewiremock.proxy(()=> require('./JwtAuthProvider'), {
        'crypto': {createPublicKey: createPublicKeyStub},
        'jose': {jwtVerify: jwtVerifyStub, createRemoteJWKSet: createRemoteJWKSetStub}
    });

    const certificate = 'MIICmzCCAYMCBgF3NTyWqjANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjEwMTI' +
        '0MTYyOTU5WhcNMzEwMTI0MTYzMTM5WjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAo' +
        'IBAQCdWS6+TbKy5LR0LfBXr5mbrSlxZiwbShbXmxrlku0xTwUO1L9fariV0otRB7S33rjwoTXdJHbpPdAruv0nIOuVGQzaN' +
        'BaJDl5+aKLVqRF8CS4kN6KwcgBeP0hyDeXysPweTdmLoFz8rgeoYjYiDO6GlT3ppSLedgemt6ljMrhfEd2AR38ESpTzzB0t' +
        'qkOqexo3offX5zB6pfU+j2rOH+aacQfhxxDm93yASZ04N4hq7rBLgUrY27tlpB+UxrkdWDqzf3gT3jiB3hHT44u7fPH5Qbd' +
        '/gY6I5QVkqu6cqmaNzaiyw2DoVvRvKxq4FYSPA/cG0Pdy8Q5WQp1DWbkKqc6ZAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAE' +
        'aq0Ezett25R7o+UVG9zZv/LWP8mVN4FaqUPSlVYACSdzGgZo+XrOtVCSqkBw33YpF0tBtEMBY1Oo0ZEfyICa8X7tACojgg5' +
        'xy5efFQF79Qi6XuprDRXv6GW062Kxdx8cT4Bw/1/z0GwlOLolqfLm8QbdGP8GmSC9ONusx5KBIo7XaneO/YZocPfEd3zbyr' +
        'x/Rc2J43ycMz+LnKpLA357qqVvzcg+9hxTZ6H/3SQS95XLNt9rw2q5pffutKcbtT5Dq8jND9G3SzcC2RL9GWIcnEOuz+9l4' +
        'F9KVAdfaUzyKkxVB4IHy9CaFJJT66ZfiLyhRrv3GZB1RdUB51ivqKDmA=';

    beforeEach(() => {
        sandbox.reset();
    });

    /**
     * Constructor
     */
    describe('constructor', () => {
        it('should throw an error when there is no certificate nor jwks uri', async () => {
            try {
                new m.JwtAuthProvider({
                    name: 'jwt',
                    application: 'test',
                    authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                });
            } catch (err) {
                chai.expect(err.message).equal('No jwks nor certificate options are defined');
            }
        });

        it('should call crypto when there is a certificate', async () => {
            createPublicKeyStub
                .withArgs('-----BEGIN CERTIFICATE-----\n' + certificate + '\n-----END CERTIFICATE-----')
                .returns(undefined);

            new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate
            });

            chai.expect(createPublicKeyStub.callCount).equal(1);
        });

        it('should call remote jwks when there is a jwks uri', async () => {
            const jwksUri = 'https://keycloak';
            createRemoteJWKSetStub
                .withArgs(new URL(jwksUri))
                .returns(undefined);

            new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                jwksUri
            });

            chai.expect(createRemoteJWKSetStub.callCount).equal(1);
        });

        it('should call remote jwks when there is a jwks uri and a certificate', async () => {

            const jwksUri = 'https://keycloak';
            createRemoteJWKSetStub
                .withArgs(new URL(jwksUri))
                .returns(undefined);
            createPublicKeyStub
                .withArgs(sinon.match.any)
                .returns(undefined);

            new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                jwksUri,
                certificate
            });

            chai.expect(createRemoteJWKSetStub.callCount).equal(1);
            chai.expect(createPublicKeyStub.callCount).equal(0);
        });
    });

    /**
     * Authenticate
     */
    describe('authenticate', () => {

        it('should throw an error when token is not defined', async () => {

            const provider = new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate,
            });

            try {
                await provider.authenticate({} as Request, undefined, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Authorization header is missing');
            }
        });

        it('should throw an error when token scheme is not bearer', async () => {

            const provider = new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate,
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

            const provider = new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate,
            });
            const token: Token = {
                params: undefined,
                scheme: 'bearer',
                token: '1234567890',
            };

            jwtVerifyStub
                .withArgs('1234567890', sinon.match.any, undefined)
                .throws(new Error('Token expired'));

            try {
                await provider.authenticate({} as Request, token, {});
                chai.expect.fail();
            } catch (err) {
                chai.expect(err.message).equal('Token expired');
            }
        });

        it('should not throw an error when everything is ok', async () => {

            const provider = new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate,
            });
            const token: Token = {
                params: undefined,
                scheme: 'bearer',
                token: '1234567890',
            };

            jwtVerifyStub
                .withArgs('1234567890', sinon.match.any, undefined)
                .resolves({
                    key: undefined,
                    protectedHeader: undefined,
                    payload: {
                        iss: 'localhost'
                    }
                });

            await provider.authenticate({} as Request, token, {});
        });

        it('should return authenticated user', async () => {

            const provider = new m.JwtAuthProvider({
                name: 'jwt',
                application: 'test',
                authorizationUrl: 'http://localhost:9000/auth/realms/master/protocol/openid-connect/auth?nonce=',
                certificate,
            });
            const token: Token = {
                params: undefined,
                scheme: 'bearer',
                token: '1234567890',
            };
            const userLogin = 'user1';
            const payload = {
                iss: 'localhost',
                preferred_username: userLogin
            };

            jwtVerifyStub
                .withArgs('1234567890', sinon.match.any, undefined)
                .resolves({
                    key: undefined,
                    payload,
                    protectedHeader: {
                        alg: undefined
                    }
                });

            const user = new Principal({
                login: userLogin,
            });
            sandbox.stub(provider, 'provideUser')
                .withArgs(payload, token)
                .returns(user);

            const actualUser = await provider.authenticate({} as Request, token, {});
            chai.expect(actualUser).equal(user);
        });
    });
});

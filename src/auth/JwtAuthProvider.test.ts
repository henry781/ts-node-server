import {Token} from 'auth-header';
import * as chai from 'chai';
import * as jwt from 'jsonwebtoken';
import * as sinon from 'sinon';
import {JwtAuthProvider} from './JwtAuthProvider';
import {Principal} from './Principal';

describe('JwtAuthProvider', () => {

    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.restore();
    });

    /**
     * Get scheme
     */
    describe('getScheme', () => {

        it('should return bearer', () => {
            const provider = new JwtAuthProvider();
            chai.expect(provider.getScheme()).equal('bearer');
        });
    });

    /**
     * Authenticate
     */
    describe('authenticate', () => {

        it('should throw an error when verify throw an error', () => {

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

            chai.expect(() => provider.authenticate(token, {}))
                .to.throw('Token expired');
        });

        it('should not throw an error when everything is ok', () => {

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

            provider.authenticate(token, {});
        });

        it('should return authenticated user', () => {

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

            const actualUser = provider.authenticate(token, {});
            chai.expect(actualUser).equal(user);
        });
    });
});

import * as chai from 'chai';
import {Container} from 'inversify';
import * as sinon from 'sinon';
import {Request, types} from '../types';
import {AuthUtil} from './AuthUtil';
import {BasicAuthProvider} from './BasicAuthProvider';
import {JwtAuthProvider} from './JwtAuthProvider';

/**
 * AuthUtil
 */
describe('AuthUtil', () => {

    /**
     * parseAuthorizationHeader
     */
    describe('parseAuthorizationHeader', () => {

        it('should return undefined when authorization header is not defined', () => {

            const request: Request = {
                body: undefined,
                headers: {},
                hostname: undefined,
                id: undefined,
                ip: undefined,
                ips: undefined,
                log: undefined,
                params: undefined,
                query: undefined,
                raw: undefined,
                req: undefined,
            };

            const result = AuthUtil.parseAuthorizationHeader(request);
            chai.expect(result).to.be.undefined;
        });

        it('should parse token', () => {

            const request: Request = {
                body: undefined,
                headers: {
                    authorization: 'Basic dXNlcjE6aHl6LUR2ci00ZXQtcnlL',
                },
                hostname: undefined,
                id: undefined,
                ip: undefined,
                ips: undefined,
                log: undefined,
                params: undefined,
                query: undefined,
                raw: undefined,
                req: undefined,
            };

            const result = AuthUtil.parseAuthorizationHeader(request);
            chai.expect(result.scheme).equal('Basic');
            chai.expect(result.token).equal('dXNlcjE6aHl6LUR2ci00ZXQtcnlL');
        });
    });

    /**
     * normalizeAuthOptions
     */
    describe('normalizeAuthOptions', () => {

        it('should normalize authOptions (string)', () => {
            const input = 'jwt';
            const result = AuthUtil.normalizeAuthOptions(input);
            chai.expect(result).deep.equal([
                {providerName: 'jwt'},
            ]);
        });

        it('should normalize authOptions (string[])', () => {
            const input = ['jwt', 'basic'];
            const result = AuthUtil.normalizeAuthOptions(input);
            chai.expect(result).deep.equal([
                {providerName: 'jwt'},
                {providerName: 'basic'},
            ]);
        });

        it('should normalize authOptions (string[])', () => {
            const input = {
                jwt: {
                    role: ['admin'],
                },
            };
            const result = AuthUtil.normalizeAuthOptions(input);

            chai.expect(result).deep.equal([
                {
                    providerName: 'jwt',
                    role: ['admin'],
                },
            ]);
        });
    });

    /**
     * getAuthProvidersByScheme
     */
    describe('getAuthProviders', () => {

        it('should return auth providers by scheme', () => {

            const container = new Container();
            const jwtAuthProvider = new JwtAuthProvider({
                application: 'test-app',
                authorizationUrl: 'http://mocked/auth',
                jwksUri: 'http://mocked/jwks',
            });
            const basicAuthProvider = new BasicAuthProvider();

            const getNamed = sinon.stub(container, 'getNamed');
            getNamed.withArgs(types.AuthProvider, 'jwt')
                .returns(jwtAuthProvider);
            getNamed.withArgs(types.AuthProvider, 'basic')
                .returns(basicAuthProvider);

            const authOptions = [
                {
                    providerName: 'jwt',
                    role: ['admin'],
                },
                {
                    providerName: 'basic',
                    role: ['super-admin'],
                },
            ];

            const providers = AuthUtil.getAuthProviders(container, authOptions);

            chai.expect(getNamed.callCount).equal(2);
            chai.expect(providers).length(2);
            chai.expect(providers[0]).deep.equal({
                options: authOptions[0],
                provider: jwtAuthProvider,
            });
            chai.expect(providers[1]).deep.equal({
                options: authOptions[1],
                provider: basicAuthProvider,
            });
        });
    });
});

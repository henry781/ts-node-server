import * as chai from 'chai';
import {Container} from 'inversify';
import * as sinon from 'sinon';
import {Request, types} from '../types';
import {AuthUtil} from './AuthUtil';
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
    describe('getAuthProvidersByScheme', () => {

        it('should return auth providers by scheme', () => {

            const container = new Container();
            const jwtAuthProvider = new JwtAuthProvider();
            const getNamed = sinon.stub(container, 'getNamed')
                .withArgs(types.AuthProvider, 'jwt')
                .returns(jwtAuthProvider);

            const authOptions = [
                {
                    providerName: 'jwt',
                    role: ['admin'],
                },
            ];

            const providersByScheme = AuthUtil.getAuthProvidersByScheme(container, authOptions);

            chai.expect(getNamed.calledOnce).to.be.true;
            chai.expect(providersByScheme.bearer)
                .deep.equal({
                options: authOptions[0],
                provider: jwtAuthProvider,
            });
        });
    });
});

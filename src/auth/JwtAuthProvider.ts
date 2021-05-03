import {Token} from 'auth-header';
import {environment} from '../core/environment';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {Request} from '../types';
import {AuthProvider} from './AuthProvider';
import {Principal} from './Principal';
import * as jwks from 'jose/jwks/remote';
import * as jwt from 'jose/jwt/verify';
import * as crypto from 'crypto';
import {KeyObject} from 'crypto';

/**
 * Jwt authentication provider
 */
export class JwtAuthProvider extends AuthProvider {

    public get options(): JwtAuthProviderOptions {
        return this._options;
    }

    public get verifyingKey(): KeyObject | jwt.JWTVerifyGetKey {
        return this._verifyingKey;
    }

    private readonly _options: JwtAuthProviderOptions;
    private readonly _verifyingKey: KeyObject | jwt.JWTVerifyGetKey;

    /**
     * Constructor
     * @param {JwtAuthProviderOptions} options
     */
    constructor(options: JwtAuthProviderOptions = DEFAULT_JWT_AUTH_PROVIDER_OPTIONS) {
        super();
        this._options = options;

        // use jwks first
        if (this._options.jwksUri) {
            this._verifyingKey = jwks.createRemoteJWKSet(new URL(this._options.jwksUri));
        } else if (this._options.certificate) {
            const certificate = '-----BEGIN CERTIFICATE-----\n' + this._options.certificate + '\n-----END CERTIFICATE-----';
            this._verifyingKey = crypto.createPublicKey(certificate);
        } else {
            throw new Error('No jwks nor certificate options are defined');
        }
    }

    /**
     * Authenticate
     * @param request
     * @param token
     * @param options
     */
    public async authenticate(request: Request, token: Token, options: AuthOptions): Promise<Principal> {

        if (!token) {
            throw new Error('Authorization header is missing');
        }

        if (!token.scheme || token.scheme.toLowerCase() !== 'bearer') {
            throw new Error('Authorization scheme should be \'bearer\'');
        }

        const jwtToken = Array.isArray(token.token) ? token.token[0] : token.token;
        const { payload } = await jwt.jwtVerify(jwtToken, this._verifyingKey, this._options.jwtVerifyOptions)
        return this.provideUser(payload, token);
    }

    /**
     * Provide user
     * @param {object} decodedToken
     * @param {Token} token
     * @returns {Principal}
     */
    public provideUser(decodedToken: object, token: Token): Principal {

        // tslint:disable-next-line:no-string-literal
        const resourceAccess = decodedToken['resource_access'];

        const roles = resourceAccess && resourceAccess[this._options.application]
        && resourceAccess[this._options.application].roles
            ? resourceAccess[this._options.application].roles
            : [];

        return new Principal({
            // tslint:disable-next-line:no-string-literal
            email: decodedToken['email'],
            // tslint:disable-next-line:no-string-literal
            firstname: decodedToken['given_name'],
            // tslint:disable-next-line:no-string-literal
            lastname: decodedToken['family_name'],
            // tslint:disable-next-line:no-string-literal
            login: decodedToken['preferred_username'],
            roles,
            token,
        });
    }
}

export const DEFAULT_JWT_AUTH_PROVIDER_OPTIONS: JwtAuthProviderOptions = {
    application: environment.AUTH_JWT_APPLICATION,
    authorizationUrl: environment.AUTH_JWT_AUTHORIZATION_URL,
    certificate: environment.AUTH_JWT_CERTIFICATE,
    jwksUri: environment.AUTH_JWKS_URI,
};

export interface JwtAuthProviderOptions {
    certificate?: string;
    jwksUri?: string;
    jwtVerifyOptions?: jwt.JWTVerifyOptions;
    authorizationUrl: string;
    application: string;
}
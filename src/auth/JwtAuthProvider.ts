import {Token} from 'auth-header';
import * as jwt from 'jsonwebtoken';
import {environment} from '../core/environment';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {Request} from '../types';
import {AuthProvider} from './AuthProvider';
import {Principal} from './Principal';

/**
 * Jwt authentication provider
 */
export class JwtAuthProvider extends AuthProvider {

    public get options(): JwtAuthProviderOptions {
        return this._options;
    }

    private _options: JwtAuthProviderOptions;
    private _certificate: string;

    /**
     * Constructor
     * @param {JwtAuthProviderOptions} options
     */
    constructor(options: JwtAuthProviderOptions = DEFAULT_JWT_AUTH_PROVIDER_OPTIONS) {
        super();
        this._options = options;
        this._certificate = '-----BEGIN CERTIFICATE-----\n' + this._options.certificate + '\n-----END CERTIFICATE-----';
    }

    /**
     * Authenticate
     * @param request
     * @param token
     * @param options
     */
    public async authenticate(request: Request, token: Token, options: AuthOptions): Promise<Principal> {

        if (!token || !token.scheme || token.scheme.toLowerCase() !== 'bearer') {
            throw new Error('Jwt auth: authorization scheme should be \'bearer\'');
        }

        const jwtToken = Array.isArray(token.token) ? token.token[0] : token.token;
        const decodedToken = jwt.verify(jwtToken, this._certificate) as object;
        return this.provideUser(decodedToken, token);
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
};

export interface JwtAuthProviderOptions {
    certificate: string;
    authorizationUrl: string;
    application: string;
}

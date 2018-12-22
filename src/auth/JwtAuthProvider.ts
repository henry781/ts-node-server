import {Token} from 'auth-header';
import * as jwt from 'jsonwebtoken';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {AuthProvider} from './AuthProvider';
import {DEFAULT_JWT_AUTH_PROVIDER_OPTIONS, JwtAuthProviderOptions} from './JwtAuthProviderOptions';
import {Principal} from './Principal';

/**
 * Jwt authentication provider
 */
export class JwtAuthProvider extends AuthProvider {

    public get options(): JwtAuthProviderOptions {
        return this._options;
    }

    private _options: JwtAuthProviderOptions;

    /**
     * Constructor
     * @param {JwtAuthProviderOptions} options
     */
    constructor(options: JwtAuthProviderOptions = DEFAULT_JWT_AUTH_PROVIDER_OPTIONS) {
        super();
        this._options = options;
    }

    /**
     * Get scheme
     * @returns {string}
     */
    public getScheme() {
        return 'bearer';
    }

    /**
     * Authenticate
     * @param {Token} token
     * @param {AuthOptions} options
     * @returns {Principal}
     */
    public authenticate(token: Token, options: AuthOptions): Principal {
        const jwtToken = Array.isArray(token.token) ? token.token[0] : token.token;
        const decodedToken = jwt.verify(jwtToken, this._options.certificate) as object;
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

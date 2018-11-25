import {AuthProvider} from './AuthProvider';
import {Token} from 'auth-header';
import * as jwt from 'jsonwebtoken';
import {Principal} from './Principal';
import {Environment} from '../Environment';
import {JwtAuthProviderOptions} from './JwtAuthProviderOptions';

const DEFAULT_JWT_AUTH_PROVIDER_OPTIONS: JwtAuthProviderOptions = {
    certificate: Environment.AUTH_JWT_CERTIFICATE
};

/**
 * Jwt authentication provider
 */
export class JwtAuthProvider extends AuthProvider {

    private _certificate;

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
     * @returns {Principal}
     */
    public authenticate(token: Token): Principal {

        // TODO : map jwt decoded token to principal
        return jwt.verify(token, this._certificate);
    }

    /**
     * Constructor
     * @param {JwtAuthProviderOptions} options
     */
    constructor(options: JwtAuthProviderOptions = DEFAULT_JWT_AUTH_PROVIDER_OPTIONS) {
        super();
        this._certificate = options.certificate;
    }
}

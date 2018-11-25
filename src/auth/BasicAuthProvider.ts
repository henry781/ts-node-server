import {AuthProvider} from './AuthProvider';
import {Token} from 'auth-header';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {Principal} from './Principal';
import {BasicAuthProviderOptions} from './BasicAuthProviderOptions';
import {Environment} from '../Environment';

const DEFAULT_BASIC_AUTH_PROVIDER_OPTIONS: BasicAuthProviderOptions = {
    login: Environment.AUTH_BASIC_LOGIN,
    password: Environment.AUTH_BASIC_PASSWORD
};

/**
 * Basic authentication provider
 */
export class BasicAuthProvider extends AuthProvider {

    private _login: string;
    private _password: string;

    /**
     * Authenticate
     * @param {Token} token
     * @param {AuthOptions} options
     * @returns {Principal}
     */
    public authenticate(token: Token, options: AuthOptions): Principal {

        const decoded = new Buffer(token.token.toString(), 'base64').toString('ascii');
        console.log(decoded);

        throw new Error('not implemented');
    }

    /**
     * Get authentication scheme
     * @returns {string}
     */
    public getScheme(): string {
        return 'basic';
    }

    /**
     * Constructor
     * @param {BasicAuthProviderOptions} options
     */
    constructor(options = DEFAULT_BASIC_AUTH_PROVIDER_OPTIONS) {
        super();
        this._login = options.login;
        this._password = options.password;
    }
}

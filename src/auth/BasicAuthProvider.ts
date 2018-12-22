import {Token} from 'auth-header';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {AuthProvider} from './AuthProvider';
import {BasicAuthProviderOptions, DEFAULT_BASIC_AUTH_PROVIDER_OPTIONS} from './BasicAuthProviderOptions';
import {BasicAuthUserOptions} from './BasicAuthUserOptions';
import {Principal} from './Principal';

/**
 * Basic authentication provider
 */
export class BasicAuthProvider extends AuthProvider {

    public get options(): BasicAuthProviderOptions {
        return this._options;
    }

    private _options: BasicAuthProviderOptions;

    /**
     * Constructor
     * @param {BasicAuthProviderOptions} options
     */
    constructor(options = DEFAULT_BASIC_AUTH_PROVIDER_OPTIONS) {
        super();
        this._options = options;
    }

    /**
     * Authenticate
     * @param {Token} token
     * @param {AuthOptions} options
     * @returns {Principal}
     */
    public authenticate(token: Token, options: AuthOptions): Principal {

        const decoded = new Buffer(token.token.toString(), 'base64')
            .toString('ascii');

        const separatorPosition = decoded.indexOf(':');
        const login = decoded.substring(0, separatorPosition);
        const password = decoded.substring(separatorPosition + 1);

        const userOptions = this.options[login];

        if (!userOptions || userOptions.password !== password) {
            throw new Error('bad credentials');
        }

        return this.provideUser(login, userOptions, token);
    }

    /**
     * Provide user
     * @param login
     * @param userOptions
     * @param token
     */
    public provideUser(login: string, userOptions: BasicAuthUserOptions, token: Token): Principal {
        return new Principal({
            email: userOptions.email,
            firstname: userOptions.firstname,
            lastname: userOptions.lastname,
            login,
            roles: userOptions.roles,
            token,
        });
    }

    /**
     * Get authentication scheme
     * @returns {string}
     */
    public getScheme(): string {
        return 'basic';
    }
}

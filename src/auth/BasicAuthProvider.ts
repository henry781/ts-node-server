import {Token} from 'auth-header';
import {environment} from '../core/environment';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {Request} from '../types';
import {AuthProvider} from './AuthProvider';
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
     * @param request
     * @param token
     * @param options
     */
    public async authenticate(request: Request, token: Token, options: AuthOptions): Promise<Principal> {

        if (!token || !token.scheme || token.scheme.toLowerCase() !== 'basic') {
            throw new Error('Basic auth: authorization scheme should be \'basic\'');
        }

        const decoded = Buffer.from(token.token.toString(), 'base64')
            .toString('ascii');

        const separatorPosition = decoded.indexOf(':');
        const login = decoded.substring(0, separatorPosition);
        const password = decoded.substring(separatorPosition + 1);

        const userOptions = this.options[login];

        if (!userOptions || userOptions.password !== password) {
            throw new Error('Basic auth: bad credentials');
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
}

export const DEFAULT_BASIC_AUTH_PROVIDER_OPTIONS: BasicAuthProviderOptions = {
    [environment.AUTH_BASIC_LOGIN]: {
        password: environment.AUTH_BASIC_PASSWORD,
    },
};

export interface BasicAuthProviderOptions {
    [login: string]: BasicAuthUserOptions;
}

export interface BasicAuthUserOptions {
    password: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    roles?: string[];
}

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
        super(options.name);
        this._options = options;
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

        if (!token.scheme || token.scheme.toLowerCase() !== 'basic') {
            throw new Error('Authorization scheme should be \'basic\'');
        }

        const decoded = Buffer.from(token.token.toString(), 'base64')
            .toString('ascii');

        const separatorPosition = decoded.indexOf(':');
        const login = decoded.substring(0, separatorPosition);
        const password = decoded.substring(separatorPosition + 1);

        const userOptions = this.options.users[login];

        if (!userOptions || userOptions.password !== password) {
            throw new Error('Bad credentials');
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
    name: 'basic',
    users: {
        [environment.AUTH_BASIC_LOGIN]: {
            password: environment.AUTH_BASIC_PASSWORD,
        }
    }
};

export interface BasicAuthProviderOptions {
    name: string,
    users: {
        [login: string]: BasicAuthUserOptions
    }
}

export interface BasicAuthUserOptions {
    password: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    roles?: string[];
}

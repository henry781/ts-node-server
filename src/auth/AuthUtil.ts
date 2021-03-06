import {parse, Token} from 'auth-header';
import {Container} from 'inversify';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {Request, types} from '../types';
import {AuthProvider} from './AuthProvider';

export class AuthUtil {

    /**
     * Parse authorization header
     * @param {Request} request
     * @returns {Token}
     */
    public static parseAuthorizationHeader(request: Request): Token {
        if (!request.headers.authorization) {
            return undefined;
        }
        return parse(request.headers.authorization);
    }

    /**
     * Normalize auth options
     * @returns {AuthOptions[]}
     * @param authOptions
     */
    public static normalizeAuthOptions(
        authOptions: string
            | string[]
            | { [providerName: string]: AuthOptions }): AuthOptions[] {

        if (typeof (authOptions) === 'string') {
            return [{providerName: authOptions}];

        } else if (Array.isArray(authOptions)) {
            return authOptions.map((a) => ({providerName: a}));

        } else {

            return Object.keys(authOptions)
                .map((providerName) => {
                    return {...authOptions[providerName], providerName};
                });

        }
    }

    public static getAuthProviders(container: Container, authOptions: AuthOptions[])
        : { provider: AuthProvider, options: AuthOptions }[] {

        return authOptions.map(
            (options) => ({
                options,
                provider: container.getNamed<AuthProvider>(types.AuthProvider, options.providerName),
            }));
    }
}

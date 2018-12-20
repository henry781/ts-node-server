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
     * @param {string | string[] | {[p: string]: AuthOptions}} authOptions
     * @returns {AuthOptions[]}
     */
    public static normalizeAuthOptions(
        authOptions: string
            | string[]
            | { [providerName: string]: AuthOptions }): AuthOptions[] {

        if (typeof (authOptions) === 'string') {
            return [{providerName: authOptions}];

        } else if (Array.isArray(authOptions)) {
            return authOptions.map((a) => {
                return {providerName: a};
            });

        } else {
            return Object.keys(authOptions)
                .map((providerName) => {
                    return {...authOptions, providerName};
                });
        }
    }

    /**
     * Get auth providers by scheme
     * @param {Container} container
     * @param {AuthOptions[]} authOptions
     * @returns {{[p: string]: {provider: AuthProvider; options: AuthOptions}}}
     */
    public static getAuthProvidersByScheme(container: Container, authOptions: AuthOptions[])
        : {
        [scheme: string]: {
            provider: AuthProvider,
            options: AuthOptions,
        },
    } {

        const result = {};

        for (const a of authOptions) {

            const authProvider = container.getNamed<AuthProvider>(types.AuthProvider, a.providerName);

            result[authProvider.getScheme()] = {
                options: a,
                provider: authProvider,
            };
        }

        return result;
    }
}

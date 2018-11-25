import {parse, Token} from 'auth-header';
import {Request, Types} from '../Types';
import {WireupEndpoint} from '../plugins/common/CommonUtil';
import {AuthDefinition} from '../plugins/common/method/AuthDefinition';
import {Container} from 'inversify';
import {AuthProvider} from './AuthProvider';

export class AuthUtil {

    public static parseAuthorizationHeader(request: Request): Token {
        if (!request.headers.authorization) {
            return undefined;
        }
        return parse(request.headers.authorization);
    }

    public static getAuthDefinitions(container: Container, endpoint: WireupEndpoint): AuthDefinition[] {

        if (typeof(endpoint.methodOptions.auth) === 'string') {
            return [{
                provider: container.getNamed(Types.AuthProvider, endpoint.methodOptions.auth),
                options: {}
            }];

        } else if (Array.isArray(endpoint.methodOptions.auth)) {
            return endpoint.methodOptions.auth.map(a => {
                return {
                    provider: container.getNamed<AuthProvider>(Types.AuthProvider, a),
                    options: {}
                };
            });


        } else {
            return Object.keys(endpoint.methodOptions.auth).map(a => {
                return {
                    provider: container.getNamed<AuthProvider>(Types.AuthProvider, a),
                    options: endpoint.methodOptions.auth[a]
                }
            });
        }
    }

    public static groupByScheme(authDefinitions: AuthDefinition[]): { [scheme: string]: AuthDefinition } {

        const result = {};

        for (let i = authDefinitions.length - 1; i >= 0; i--) {
            result[authDefinitions[i].provider.getScheme()] = authDefinitions[i];
        }

        return result;
    }
}
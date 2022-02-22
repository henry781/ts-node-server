import {QuerySearch} from '@henry781/querysearch';
import accepts from 'accepts';
import {FastifyInstance} from 'fastify';
import flatstr from 'flatstr';
import {Container} from 'inversify';
import * as yaml from 'js-yaml';
import {isNullOrUndefined} from 'tipify';
import {AuthUtil} from '../../auth/AuthUtil';
import {Principal} from '../../auth/Principal';
import {jsonConverter} from '../../core/jsonConverter';
import {WebServiceError} from '../../core/WebServiceError';
import {getReqId} from '../../logger/loggerService';
import {Reply, Request} from '../../types';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import {AuthOptions} from '../common/method/AuthOptions';

/**
 * Wireup plugin
 */
export class Wireup {

    /**
     * Get handler
     * @param {WireupEndpoint} endpoint
     * @param {FastifyInstance} instance
     * @returns {(request: Request, reply: Reply) => Promise<any>}
     */
    public static getHandler(endpoint: WireupEndpoint, instance: FastifyInstance) {

        return async (request: Request, reply: Reply) => {

            const args = endpoint.paramsOptions.map((param) => {

                switch (param.type) {
                    case 'query':
                        const value = request.query[param.name];
                        return jsonConverter.deserialize(value, param.paramType);
                    case 'path':
                        return request.params[param.name];
                    case 'body':
                        return jsonConverter.deserialize(request.body, param.paramType);
                    case 'search':
                        try {
                            return QuerySearch.fromQueryParams(request.query);
                        } catch (err) {
                            throw new WebServiceError(err.message, 400);
                        }
                    case 'httpRequest':
                        return request;
                    case 'httpReply':
                        return reply;
                    case 'auth':
                        return request.user;
                    case 'logger':
                        return request.log;
                    case 'instanceLogger':
                        return instance.log;
                    default:
                        return undefined;
                }
            });

            return endpoint.controller[endpoint.method].apply(endpoint.controller, args)
                .then((result) => {
                    if (!reply.sent) {
                        const reqId = getReqId();
                        reply.header('request-id', reqId);
                        if (isNullOrUndefined(result)) {
                            reply.status(204);
                        }
                    }

                    const view = request.query.view as string;
                    const views = endpoint.methodOptions.views;
                    if (view && view !== 'DEFAULT' && views && views[view]) {
                        return views[view](result);
                    }

                    return result;
                });
        };
    }

    /**
     * Get authorization handler
     * @param {Container} container
     * @param {WireupEndpoint} endpoint
     * @returns {any}
     */
    public static getAuthorizationHandler(container: Container, endpoint: WireupEndpoint) {

        function sendUnauthorized(reply: Reply, reason: Error | string | { [key: string]: string }) {
            const body = {reason};
            reply.status(401).send(body);
        }

        if (!endpoint.methodOptions.auth) {
            return;
        }

        const authOptions = AuthUtil.normalizeAuthOptions(endpoint.methodOptions.auth);
        const authProviders = AuthUtil.getAuthProviders(container, authOptions);

        return async (request: Request, reply: Reply) => {

            let token;
            try {
                token = AuthUtil.parseAuthorizationHeader(request);
            } catch (err) {
                sendUnauthorized(reply, err);
                return;
            }

            let user: Principal;
            let options: AuthOptions;
            const errors: { [providerName: string]: string } = {};
            for (const a of authProviders) {
                try {
                    user = await a.provider.authenticate(request, token, a.options);
                    options = a.options;
                    break;
                } catch (err) {
                    errors[a.options.providerName] = err.message;
                    request.log.warn('Cannot authenticate using authenticator', a.options.providerName);
                }
            }

            if (user) {
                if (options.role && !user.hasRole(options.role)) {
                    sendUnauthorized(reply, `User should have role <${options.role}>`);
                }
                request.user = user;
                request.log.info({login: user.login}, 'authenticated successfully');

            } else {
                sendUnauthorized(reply, errors);
            }

            return;
        };
    }

    public static getJsonSerializer() {

        return (data) => {
            const json = jsonConverter.serialize(data, undefined, {unsafe: true});
            return flatstr(JSON.stringify(json));
        };
    }

    public static getYamlSerializer() {

        return (data) => {
            const json = jsonConverter.serialize(data, undefined, {unsafe: true});
            return flatstr(yaml.dump(json));
        };

    }

    public static getSerializerHandler() {

        return (request: Request, reply: Reply, done) => {

            const accept = accepts(request as any);

            switch (accept.type(['json', 'application/x-yaml'])) {
                case 'json':
                    reply.header('Content-Type', 'application/json')
                        .serializer(Wireup.getJsonSerializer());
                    break;
                case 'application/x-yaml':
                    reply.header('Content-Type', 'application/x-yaml')
                        .serializer(Wireup.getYamlSerializer());
                    break;
            }
            done();
        };
    }

    /**
     * Get wireup plugin
     * @param {FastifyInstance} instance
     * @param {{container: Container}} opts
     * @param {(err?: Error) => void} next
     */
    public static getPlugin(
        instance: FastifyInstance,
        opts: { container: Container },
        next: (err?: Error) => void) {

        const logger = instance.log.child({module: 'Wireup', method: 'getPlugin'});

        logger.info('initializing wireup...');

        CommonUtil.getAllEndpoints(opts.container).forEach(
            (endpoint) => {

                instance.route({
                    handler: Wireup.getHandler(endpoint, instance),
                    method: endpoint.methodOptions.method,
                    onRequest: [
                        Wireup.getAuthorizationHandler(opts.container, endpoint)]
                        .filter((handler) => handler !== undefined),
                    preHandler: [
                        Wireup.getSerializerHandler()]
                        .filter((handler) => handler !== undefined),
                    url: endpoint.url,
                });
                logger.debug(`[${endpoint.methodOptions.method}] ${endpoint.url}`);
            });

        logger.info('wireup initialized');
        next();
    }
}

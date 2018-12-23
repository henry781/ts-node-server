import * as _accepts from 'accepts';
import {FastifyInstance} from 'fastify';
import * as _flatstr from 'flatstr';
import {Container} from 'inversify';
import * as _yaml from 'js-yaml';
import {AuthUtil} from '../../auth/AuthUtil';
import {loggerService} from '../../core/loggerService';
import {JsonConverter} from '../../json/JsonConverter';
import {Reply, Request} from '../../types';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import {QuerySearch} from '../common/param/QuerySearch';

const accepts = _accepts;
const flatstr = _flatstr;
const yaml = _yaml;

/**
 * Wireup plugin
 */
export class Wireup {

    /**
     * Get handler
     * @param {WireupEndpoint} endpoint
     * @returns {(request: Request, reply: Reply) => Promise<any>}
     */
    public static getHandler(endpoint: WireupEndpoint) {

        return async (request: Request, reply: Reply) => {

            const args = endpoint.paramsOptions.map((param) => {

                switch (param.type) {
                    case 'query':
                        if (param.paramType === Boolean) {
                            return request.query[param.name] === 'true';

                        }
                        if (param.paramType === Number) {
                            return parseInt(request.query[param.name], 10);

                        } else {
                            return request.query[param.name];
                        }
                    case 'path':
                        return request.params[param.name];
                    case 'body':
                        return JsonConverter.deserialize(request.body, param.paramType);
                    case 'search':
                        return QuerySearch.fromRequest(request);
                    case 'httpRequest':
                        return request;
                    case 'httpReply':
                        return reply;
                    case 'auth':
                        return request.user;
                    default:
                        return undefined;
                }
            });

            return endpoint.controller[endpoint.method].apply(endpoint.controller, args)
                .then((result) => {
                    if (result === undefined) {
                        reply.status(204);
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

        function sendUnauthorized(reply: Reply, reason: Error | string) {
            const body = {reason};
            reply.status(401).send(body);
        }

        if (!endpoint.methodOptions.auth) {
            return;
        }

        const normalizedAuthOptions = AuthUtil.normalizeAuthOptions(endpoint.methodOptions.auth);
        const providersByScheme = AuthUtil.getAuthProvidersByScheme(container, normalizedAuthOptions);

        return (request: Request, reply: Reply, done) => {

            const token = AuthUtil.parseAuthorizationHeader(request);

            if (!token || !token.scheme) {
                sendUnauthorized(reply, 'Authorization header is undefined or invalid');
                done();
                return;
            }

            const auth = providersByScheme[token.scheme.toLowerCase()];

            if (!auth || !auth.provider) {
                sendUnauthorized(reply, 'Authorization provider is undefined');
                done();
                return;
            }

            try {
                request.user = auth.provider.authenticate(token, auth.options);
            } catch (err) {
                sendUnauthorized(reply, err);
            }
            done();
            return;
        };
    }

    public static getJsonSerializer() {

        return (data) => {
            const json = JsonConverter.safeSerialize(data);
            return flatstr(JSON.stringify(json));
        };
    }

    public static getYamlSerializer() {

        return (data) => {
            const json = JsonConverter.safeSerialize(data);
            return flatstr(yaml.safeDump(json));
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
     * @param {fastify.FastifyInstance} instance
     * @param {{container: Container}} opts
     * @param {(err?: Error) => void} next
     */
    public static getPlugin(
        instance: FastifyInstance,
        opts: { container: Container },
        next: (err?: Error) => void) {

        const logger = Wireup.logger.child({method: 'getPlugin'});

        logger.info('initializing wireup...');

        CommonUtil.getAllEndpoints(opts.container).forEach(
            (endpoint) => {

                instance.route({
                    beforeHandler: [
                        Wireup.getAuthorizationHandler(opts.container, endpoint),
                        Wireup.getSerializerHandler()]
                        .filter((handler) => handler !== undefined),
                    handler: Wireup.getHandler(endpoint),
                    method: endpoint.methodOptions.method,
                    url: endpoint.url,
                });
                logger.debug(`[${endpoint.methodOptions.method}] ${endpoint.url}`);
            });

        logger.info('wireup initialized');
        next();
    }

    private static logger = loggerService.child({module: 'Wireup'});
}

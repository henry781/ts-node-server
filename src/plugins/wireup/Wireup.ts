import {FastifyInstance} from 'fastify';
import {Container} from 'inversify';
import {JsonConverter} from '../../json/JsonConverter';
import {Reply, Request} from '../../Types';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import {AuthUtil} from '../../auth/AuthUtil';

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
                        return request.query[param.name];
                    case 'path':
                        return request.params[param.name];
                    case 'body':
                        return JsonConverter.deserialize(request.body, param.paramType);
                    case 'httpRequest':
                        return request;
                    case 'httpReply':
                        return reply;
                    default:
                        return undefined;
                }
            });

            return endpoint.controller[endpoint.method].apply(endpoint.controller, args);
        };
    }

    /**
     * Get authorization handler
     * @param {Container} container
     * @param {WireupEndpoint} endpoint
     * @returns {any}
     */
    public static getAuthorizationHandler(container: Container, endpoint: WireupEndpoint) {

        if (!endpoint.methodOptions.auth) {
            return undefined;
        }

        function sendUnauthorized(reply: Reply) {
            reply.status(401).send('Unauthorized');
        }

        const authDefinitions = AuthUtil.groupByScheme(AuthUtil.getAuthDefinitions(container, endpoint));

        return (request: Request, reply: Reply) => {

            const token = AuthUtil.parseAuthorizationHeader(request);

            if (!token || !token.scheme) {
                sendUnauthorized(reply);
                return;
            }

            const authDefinition = authDefinitions[token.scheme.toLowerCase()];

            if (!authDefinition || !authDefinition.provider) {
                sendUnauthorized(reply);
                return;
            }

            try {
                authDefinition.provider.authenticate(token, authDefinition.options);
            } catch (err) {
                sendUnauthorized(reply);
                return;
            }
        }
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

        const logger = instance.log.child({module: 'wireupPlugin'});

        logger.info('initializing wireup...');

        CommonUtil.getAllEndpoints(opts.container).forEach(
            (endpoint) => {

                instance.route({
                    method: endpoint.methodOptions.method,
                    url: endpoint.url,
                    handler: Wireup.getHandler(endpoint),
                    beforeHandler: Wireup.getAuthorizationHandler(opts.container, endpoint)
                });
                logger.debug(`[${endpoint.methodOptions.method}] ${endpoint.url}`);
            });

        logger.info('wireup initialized');
        next();
    }
}

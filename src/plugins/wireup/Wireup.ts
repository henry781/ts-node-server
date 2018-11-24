import {FastifyInstance} from 'fastify';
import {Container} from 'inversify';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import {Reply, Request} from '../../Types';
import {JsonConverter} from '../../json/JsonConverter';

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
            endpoint => {

                instance.route({
                    method: endpoint.methodOptions.method,
                    url: endpoint.url,
                    handler: Wireup.getHandler(endpoint),
                });
                logger.debug(`[${endpoint.methodOptions.method}] ${endpoint.url}`);
            });

        logger.info('wireup initialized');
        next();
    }
}

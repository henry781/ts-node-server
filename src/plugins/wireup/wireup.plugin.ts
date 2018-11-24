import {FastifyInstance} from 'fastify';
import {Container} from 'inversify';
import {CommonUtil} from '../common/CommonUtil';
import {Reply, Request} from '../../Types';
import {JsonConverter} from '../../json/JsonConverter';

/**
 * Wireup plugin
 * @param {fastify.FastifyInstance} instance
 * @param {{container: Container}} opts
 * @param {(err?: Error) => void} next
 */
export function wireupPlugin(instance: FastifyInstance, opts: { container: Container }, next: (err?: Error) => void) {

    const logger = instance.log.child({module: 'wireupPlugin'});

    logger.info('initializing wireup...');

    CommonUtil.getAllEndpoints(opts.container).forEach(
        method => {

            const handler = async (request: Request, reply: Reply) => {

                const args = method.paramsOptions.map((param) => {

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

                return method.controller[method.method].apply(method.controller, args);
            };

            instance.route({
                method: method.methodOptions.method,
                url: method.url,
                handler,
            });
            logger.debug(`[${method.methodOptions.method}] ${method.url}`);

        });

    logger.info('wireup initialized');
    next();
}

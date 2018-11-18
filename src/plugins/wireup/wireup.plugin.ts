import {Reply, Request} from '../../Types';
import {Container} from 'inversify';
import {FastifyInstance} from 'fastify';
import {ExploredMethod, ServerUtil} from '../../core/ServerUtil';

/**
 * Wireup plugin
 * @param {fastify.FastifyInstance} instance
 * @param {{container: Container}} opts
 * @param {(err?: Error) => void} next
 */
export function wireupPlugin(instance: FastifyInstance, opts: { container: Container }, next: (err?: Error) => void) {

    const logger = instance.log.child({module: 'wireupPlugin'});

    logger.info('initializing wireup...');

    ServerUtil.exploreMethods(opts.container,
        (m:ExploredMethod) => {

            const handler = (request: Request, reply: Reply) => {

                const args = m.paramsOptions.map(param => {

                    switch (param.type) {
                        case 'query':
                            return request.query[param.name];
                        case 'path':
                            return request.params[param.name];
                        case 'body':
                            return request.body;
                        case 'httpRequest':
                            return request;
                        case 'httpReply':
                            return reply;
                        default:
                            return undefined;
                    }
                });

                return m.controller[m.method].apply(m.controller, args);
            };


            instance.route({
                method: m.methodOptions.method,
                url: m.url,
                handler: handler
            });
            logger.info(`[${m.methodOptions.method}] ${m.url}`);

        });

    logger.info('wireup initialized');
    next();
}

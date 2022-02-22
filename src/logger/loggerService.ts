import {getNamespace} from 'cls-hooked';
import {FastifyLoggerInstance} from 'fastify';
import {Logger} from 'pino';

export const loggerService = {
    log: undefined as FastifyLoggerInstance
};

/**
 * Get a logger
 */
export function getLogger(method?: string | string[], module?: any): Logger {
    const session = getNamespace('app');

    const log = (session && session.get('log')) ? session.get('log') : loggerService.log;

    if (!method && !module) {
        return log;

    } else if (typeof method === 'string') {

        if (module && module.constructor) {
            return log.child({
                method,
                module: module.constructor.name,
            });

        } else {
            return log.child({
                method,
            });
        }

    } else {
        return log.child({method: method.join('.')});
    }
}

/**
 * Get a request id
 */
export function getReqId(): string {
    const session = getNamespace('app');
    return session ? session.get('reqId') : undefined;
}

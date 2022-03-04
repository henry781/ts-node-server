import {getNamespace} from 'cls-hooked';
import {FastifyLoggerInstance} from 'fastify';
import pino, {Logger, LoggerOptions} from 'pino';
import {environment} from '../core/environment';

export const loggerService = {
    log: undefined as FastifyLoggerInstance
};

export const DEFAULT_LOG_LEVEL = 'info';

export const DEFAULT_LOGGER_OPTIONS: LoggerOptions = {
    level: environment.LOG_LEVEL || DEFAULT_LOG_LEVEL,
    prettyPrint: environment.LOG_PRETTY ? {forceColor: true} : undefined,
    timestamp: () => `,"time":"${new Date().toISOString()}"`
};

/**
 * Get a logger
 */
export function getLogger(method?: string | string[], module?: any): Logger {
    const session = getNamespace('app');

    let log = (session && session.get('log')) ? session.get('log') : loggerService.log;
    if (!log) {
        log = pino(DEFAULT_LOGGER_OPTIONS);
    }

    if (!method && !module) {
        return log;

    } else if (typeof method === 'string') {

        if (module && module.constructor) {
            return log.child({
                'log.origin.function': method,
                'log.logger': module.constructor.name,
            });

        } else {
            return log.child({
                'log.origin.function': method,
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

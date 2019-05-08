import {getNamespace} from 'cls-hooked';
import * as _pino from 'pino';
import {Logger, LoggerOptions} from 'pino';
import {environment} from './environment';

const pino = _pino;

export const DEFAULT_LOGGER_OPTIONS: LoggerOptions = {
    level: environment.LOG_LEVEL,
    prettyPrint: environment.LOG_PRETTY ? {forceColor: true} : undefined,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
    useLevelLabels: true,
};

export const loggerService = pino(DEFAULT_LOGGER_OPTIONS);

/**
 * Get a logger
 */
export function getLogger(method?: string | string[], module?: any): Logger {
    const session = getNamespace('app');
    const logger = (session && session.get('log')) ? session.get('log') : loggerService;

    if (!method && !module) {
        return logger;

    } else if (typeof method === 'string') {

        if (module && module.constructor) {
            return logger.child({
                method,
                module: module.constructor.name,
            });

        } else {
            return logger.child({
                method,
            });
        }

    } else {
        return logger.child({method: method.join('.')});
    }
}

/**
 * Get a request id
 */
export function getReqId(): string {
    const session = getNamespace('app');
    return session ? session.get('reqId') : undefined;
}

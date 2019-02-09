import * as _pino from 'pino';
import {LoggerOptions} from 'pino';
import {environment} from './environment';

const pino = _pino;

export const DEFAULT_LOGGER_OPTIONS: LoggerOptions = {
    level: environment.LOG_LEVEL,
    prettyPrint: environment.LOG_PRETTY ? {forceColor: true} : undefined,
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
};

export const loggerService = pino(DEFAULT_LOGGER_OPTIONS);

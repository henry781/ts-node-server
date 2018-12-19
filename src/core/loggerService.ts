import * as _pino from 'pino';
import {environment} from './environment';

const pino = _pino;

export const DEFAULT_LOGGER_OPTIONS = {
    level: environment.LOG_LEVEL,
    prettyPrint: environment.LOG_PRETTY ? {forceColor: true} : undefined,
};

export const loggerService = pino(DEFAULT_LOGGER_OPTIONS);

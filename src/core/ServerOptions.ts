import {ServerOptions as FastifyServerOptions} from 'fastify';
import {Container} from 'inversify';
import {BasicAuthProviderOptions, JwtAuthProviderOptions} from '../auth/api';
import {MongoOptions} from '../mongo/api';
import {OpenApiConf} from '../plugins/swagger-generator/api';
import {environment} from './environment';

export const DEFAULT_LOGGER_OPTIONS = {
    level: environment.LOG_LEVEL,
    prettyPrint: environment.LOG_PRETTY ? {forceColor: true} : undefined,
};

export interface ServerOptions extends FastifyServerOptions {
    container: Container;
    metrics?: boolean | string;
    healthcheck?: boolean;
    swagger?: boolean | OpenApiConf;
    mongo?: boolean | MongoOptions;
    auth?: {
        jwt?: boolean | JwtAuthProviderOptions,
        basic?: boolean | BasicAuthProviderOptions,
    };
}

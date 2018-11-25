import {ServerOptions as FastifyServerOptions} from 'fastify';
import {Container} from 'inversify';
import {MongoOptions} from '../mongo/api';
import {JwtAuthProviderOptions, BasicAuthProviderOptions} from '../auth/api';
import {OpenApiConf} from '../plugins/swagger-generator/api';

export const DEFAULT_LOGGER_OPTIONS = {
    level: 'trace',
    prettyPrint: {
        forceColor: true,
    },
};

export interface ServerOptions extends FastifyServerOptions {
    container: Container;
    metrics?: boolean | string;
    swagger?: boolean | OpenApiConf;
    healthcheck?: boolean;
    mongo?: boolean | MongoOptions;
    auth?: {
        jwt?: boolean | JwtAuthProviderOptions,
        basic?: boolean | BasicAuthProviderOptions
    }
}

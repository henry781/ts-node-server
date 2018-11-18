import {ServerOptions as FastifyServerOptions} from 'fastify';
import {Container} from 'inversify';
import {MongoOptions} from '../mongo/MongoOptions';

export const DEFAULT_LOGGER_OPTIONS = {
    level: 'trace',
    prettyPrint: {
        forceColor: true,
    },
};

export interface ServerOptions extends FastifyServerOptions {
    container: Container;
    metrics?: boolean | string;
    swagger?: boolean;
    healthchecks?: boolean;
    mongo?: MongoOptions;
}

import {Container} from 'inversify';
import {ServerOptions as FastifyServerOptions} from 'fastify';
import {MongoOptions} from "../plugins/mongo/MongoOptions";

export const DEFAULT_LOGGER_OPTIONS = {
    level: 'trace',
    prettyPrint: {
        forceColor: true
    }
};

export interface ServerOptions extends FastifyServerOptions {
    container: Container;
    metrics?: boolean | string;
    swagger?: boolean;
    healthchecks?: boolean;
    mongo?: MongoOptions;
}
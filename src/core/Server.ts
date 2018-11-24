import * as _fastify from 'fastify';
import * as helmet from 'fastify-helmet';
import fastifyMetrics from 'fastify-metrics';
import {Logger} from 'pino';
import {Healthcheck, HealthcheckController} from '../healthcheck/api';
import {MongoHealthcheck, MongoService} from '../mongo/api';
import {Controller, SwaggerGenerator, Wireup} from '../plugins/api';
import {Instance, Types} from '../Types';
import {DEFAULT_LOGGER_OPTIONS, ServerOptions} from './ServerOptions';
import {Serializer} from '../plugins/serializer/Serializer';

const fastify = _fastify;

export class Server {

    /**
     * Fastify instance
     */
    private _instance: Instance;

    /**
     * Get fastify instance
     * @returns {Instance}
     */
    public get instance(): Instance {
        return this._instance;
    }

    constructor(options: ServerOptions) {

        if (!options.logger) {
            options.logger = DEFAULT_LOGGER_OPTIONS;
        }

        this._instance = fastify(options);

        options.container.bind<Logger>(Types.Logger).toConstantValue(this._instance.log);

        this._instance.register(helmet);
        this._instance.register(Serializer.getPlugin);

        if (options.healthcheck) {
            options.container.bind<Controller>(Types.Controller).to(HealthcheckController).inSingletonScope();
        }

        this._instance.register(Wireup.getPlugin, {container: options.container});

        if (options.swagger) {
            this._instance.register(SwaggerGenerator.getPlugin, {container: options.container});
        }

        if (options.metrics) {
            const endpoint = typeof(options.metrics) === 'string' ? options.metrics : '/metrics';
            this._instance.register(fastifyMetrics, {endpoint});
        }

        if (options.mongo) {
            options.container.bind<MongoService>(Types.MongoService).to(MongoService).inSingletonScope();
            options.container.bind<Healthcheck>(Types.Healthcheck).to(MongoHealthcheck).inSingletonScope();
            (options.container.get(Types.MongoService) as MongoService).connect(options.mongo);
        }

        this._instance.ready(() => {
            this._instance.log.info('\n' + this._instance.printRoutes());
        });

    }

    /**
     * Listen
     * @param {number} port
     * @returns {string}
     */
    public async listen(port: number): Promise<string> {
        return this._instance.listen(port);
    }
}

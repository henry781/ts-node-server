import fastify from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import {Logger} from 'pino';
import {HealthcheckController} from '../healthcheck/HealthcheckController';
import {MongoService} from '../mongo/MongoService';
import {swaggerPlugin} from '../plugins/swagger/swagger.plugin';
import {wireupPlugin} from '../plugins/wireup/wireup.plugin';
import {Instance, Types} from '../Types';
import {Controller} from './controller/Controller';
import {DEFAULT_LOGGER_OPTIONS, ServerOptions} from './ServerOptions';

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

        if (options.healthchecks) {
            options.container.bind<Controller>(Types.Controller).to(HealthcheckController);
        }

        this._instance.register(wireupPlugin, {container: options.container});

        if (options.swagger) {
            this._instance.register(swaggerPlugin, {container: options.container});
        }

        if (options.metrics) {
            const endpoint = typeof(options.metrics) === 'string' ? options.metrics : '/metrics';
            this._instance.register(fastifyMetrics, {endpoint});
        }

        if (options.mongo) {
            options.container.bind<MongoService>(Types.MongoService).to(MongoService);
            (options.container.get(Types.MongoService) as MongoService).connect(options.mongo);

        }
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

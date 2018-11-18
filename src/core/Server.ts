import * as fastify from 'fastify';
import {Instance, Types} from '../Types';
import * as fastifyMetrics from 'fastify-metrics';
import {DEFAULT_LOGGER_OPTIONS, ServerOptions} from './ServerOptions';
import {Logger} from 'pino';
import {swaggerPlugin} from '../plugins/swagger/swagger.plugin';
import {wireupPlugin} from '../plugins/wireup/wireup.plugin';
import {Controller} from './controller/Controller';
import {HealthcheckController} from '../plugins/healthcheck/HealthcheckController';
import {MongoService} from '../plugins/mongo/MongoService';

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

        if(options.healthchecks){
            options.container.bind<Controller>(Types.Controller).to(HealthcheckController);
        }

        this._instance.register(wireupPlugin, {container: options.container});

        if (options.swagger) {
            this._instance.register(swaggerPlugin, {container: options.container});
        }

        if (options.metrics) {
            const endpoint = typeof(options.metrics) === 'string' ? options.metrics : '/metrics';
            this._instance.register(fastifyMetrics, {endpoint: endpoint});
        }

        if(options.mongo){
            options.container.bind<MongoService>(Types.MongoService).to(MongoService);
            (<MongoService>options.container.get(Types.MongoService)).connect(options.mongo);

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
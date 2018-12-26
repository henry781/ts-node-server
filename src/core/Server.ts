import * as _fastify from 'fastify';
import * as helmet from 'fastify-helmet';
import fastifyMetrics from 'fastify-metrics';
import {Logger} from 'pino';
import {AuthProvider, BasicAuthProvider, JwtAuthProvider} from '../auth/api';
import {Healthcheck, HealthcheckController} from '../healthcheck/api';
import {MongoHealthcheck, MongoService} from '../mongo/api';
import {Controller, SwaggerGenerator, Wireup} from '../plugins/api';
import {Instance, types} from '../types';
import {environment} from './environment';
import {loggerService} from './loggerService';
import {ServerOptions} from './ServerOptions';

const fastify = _fastify;

export class Server {

    /**
     * Get fastify instance
     * @returns {Instance}
     */
    public get instance(): Instance {
        return this._instance;
    }

    /**
     * Fastify instance
     */
    private _instance: Instance;

    /**
     * Constructor
     * @param {ServerOptions} options
     */
    constructor(options: ServerOptions) {

        this.buildInstance(options);

        this._instance.ready(() => {
            this._instance.log.info('\n' + this._instance.printRoutes());
        });

    }

    /**
     * Build instance
     * @param {ServerOptions} options
     */
    public buildInstance(options: ServerOptions) {

        options.logger = loggerService;

        this._instance = fastify(options);
        this._instance.register(helmet);

        options.container.bind<Logger>(types.Logger).toConstantValue(this._instance.log);

        if (options.healthcheck !== false) {
            options.container.bind<Controller>(types.Controller).to(HealthcheckController).inSingletonScope();
        }

        this._instance.register(Wireup.getPlugin, {container: options.container});

        if (options.metrics !== false) {
            const endpoint = typeof(options.metrics) === 'string' ? options.metrics : '/metrics';
            this._instance.register(fastifyMetrics, {endpoint});
        }

        if (options.mongo) {
            options.container.bind<MongoService>(types.MongoService).to(MongoService).inSingletonScope();
            options.container.bind<Healthcheck>(types.Healthcheck).to(MongoHealthcheck).inSingletonScope();

            const service = options.container.get<MongoService>(types.MongoService);
            service.connect(typeof(options.mongo) === 'boolean' ? undefined : options.mongo);
        }

        if (options.auth) {

            if (options.auth.jwt) {
                const jwtAuthProviderOptions = typeof(options.auth.jwt) === 'boolean' ? undefined : options.auth.jwt;
                const jwtAuthProvider = new JwtAuthProvider(jwtAuthProviderOptions);
                options.container.bind<AuthProvider>(types.AuthProvider)
                    .toConstantValue(jwtAuthProvider)
                    .whenTargetNamed('jwt');
            }

            if (options.auth.basic) {
                const basicAuthProviderOptions = typeof(options.auth.basic) === 'boolean' ? undefined : options.auth.basic;
                const basicAuthProvider = new BasicAuthProvider(basicAuthProviderOptions);
                options.container.bind<AuthProvider>(types.AuthProvider)
                    .toConstantValue(basicAuthProvider)
                    .whenTargetNamed('basic');
            }
        }

        if (options.swagger !== false) {
            this._instance.register(SwaggerGenerator.getPlugin, {
                configuration: typeof(options.swagger) === 'boolean' ? undefined : options.swagger,
                container: options.container,
            });
        }
    }

    /**
     * Listen
     * @param {number} port
     * @returns {string}
     */
    public async listen(port = environment.PORT): Promise<string> {
        return this._instance.listen(port, '0.0.0.0');
    }
}

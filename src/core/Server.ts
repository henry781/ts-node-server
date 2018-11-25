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
import {Environment} from '../Environment';
import {AuthProvider, BasicAuthProvider, JwtAuthProvider} from '../auth/api';

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
            this._instance.register(SwaggerGenerator.getPlugin, {
                container: options.container,
                configuration: typeof(options.swagger) === 'boolean' ? undefined : options.swagger
            });
        }

        if (options.metrics) {
            const endpoint = typeof(options.metrics) === 'string' ? options.metrics : '/metrics';
            this._instance.register(fastifyMetrics, {endpoint});
        }

        if (options.mongo) {
            options.container.bind<MongoService>(Types.MongoService).to(MongoService).inSingletonScope();
            options.container.bind<Healthcheck>(Types.Healthcheck).to(MongoHealthcheck).inSingletonScope();

            const service = options.container.get<MongoService>(Types.MongoService);
            service.connect(typeof(options.mongo) === 'boolean' ? undefined : options.mongo);
        }

        if (options.auth) {

            if (options.auth.jwt) {
                const jwtAuthProviderOptions = typeof(options.auth.jwt) === 'boolean' ? undefined : options.auth.jwt;
                const jwtAuthProvider = new JwtAuthProvider(jwtAuthProviderOptions);
                options.container.bind<AuthProvider>(Types.AuthProvider)
                    .toConstantValue(jwtAuthProvider)
                    .whenTargetNamed('jwt');
            }

            if (options.auth.basic) {
                const basicAuthProviderOptions = typeof(options.auth.basic) === 'boolean' ? undefined : options.auth.basic;
                const basicAuthProvider = new BasicAuthProvider(basicAuthProviderOptions);
                options.container.bind<AuthProvider>(Types.AuthProvider)
                    .toConstantValue(basicAuthProvider)
                    .whenTargetNamed('basic');
            }

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
    public async listen(port = Environment.PORT): Promise<string> {
        return this._instance.listen(port);
    }
}

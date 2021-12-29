import fastify, {FastifyServerOptions} from 'fastify';
import compress, {FastifyCompressOptions} from 'fastify-compress';
import helmet from 'fastify-helmet';
import fastifyMetrics from 'fastify-metrics';
import {Container} from 'inversify';
import {Logger} from 'pino';
import * as shortid from 'shortid';
import {AdminController, AdminOptions} from '../admin/AdminController';
import {AuthProvider, BasicAuthProvider, BasicAuthProviderOptions, JwtAuthProvider, JwtAuthProviderOptions} from '../auth/api';
import {Healthcheck, HealthcheckController} from '../healthcheck/api';
import {loggerService} from '../logger/loggerService';
import {MongoHealthcheck, MongoOptions, MongoService} from '../mongo/api';
import {Controller, listProviders, OpenApiConf, SwaggerGenerator, Wireup} from '../plugins/api';
import {contextLogger} from '../plugins/context-logger/contextLogger';
import {Instance, types} from '../types';
import {environment} from './environment';

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
            this._instance.log.info('server started');
        });
    }

    /**
     * Build instance
     * @param {ServerOptions} options
     */
    public buildInstance(options: ServerOptions) {

        options.logger = options.logger || loggerService;
        options.genReqId = () => shortid.generate();
        options.requestIdHeader = 'request-id';

        this._instance = fastify(options);
        this._instance.register(helmet, {contentSecurityPolicy: false,});

        this._instance.register(contextLogger);

        options.container.bind<Logger>(types.Logger).toConstantValue(this._instance.log);

        this._instance.register(compress, options.compressOptions);

        if (options.onInit) {
            options.onInit.apply(this, [this._instance]);
        }

        listProviders().forEach(p => {
            const bind = options.container.bind(p.bind).to(p.cls).inSingletonScope();
            if (p.targetNamed) {
                bind.whenTargetNamed(p.targetNamed);
            }
        });

        if (options.healthcheck !== false) {
            options.container.bind<Controller>(types.Controller).to(HealthcheckController).inSingletonScope();
        }

        if (options.admin) {
            const adminController = new AdminController(typeof options.admin === 'boolean' ? undefined : options.admin);
            options.container.bind<Controller>(types.Controller).toConstantValue(adminController);
        }

        this._instance.register(Wireup.getPlugin, {container: options.container});

        if (options.metrics !== false) {
            const endpoint = typeof (options.metrics) === 'string' ? options.metrics : '/metrics';
            this._instance.register(fastifyMetrics, {endpoint});
        }

        if (options.mongo) {
            options.container.bind<MongoService>(types.MongoService).to(MongoService).inSingletonScope();
            options.container.bind<Healthcheck>(types.Healthcheck).to(MongoHealthcheck).inSingletonScope();

            const service = options.container.get<MongoService>(types.MongoService);
            service.connect(typeof (options.mongo) === 'boolean' ? undefined : options.mongo);
        }

        if (options.auth) {

            if (options.auth.jwt) {
                const jwtAuthProviderOptions = typeof (options.auth.jwt) === 'boolean' ? undefined : options.auth.jwt;
                const jwtAuthProvider = new JwtAuthProvider(jwtAuthProviderOptions);
                options.container.bind<AuthProvider>(types.AuthProvider)
                    .toConstantValue(jwtAuthProvider)
                    .whenTargetNamed('jwt');
            }

            if (options.auth.basic) {
                const basicAuthProviderOptions = typeof (options.auth.basic) === 'boolean' ? undefined : options.auth.basic;
                const basicAuthProvider = new BasicAuthProvider(basicAuthProviderOptions);
                options.container.bind<AuthProvider>(types.AuthProvider)
                    .toConstantValue(basicAuthProvider)
                    .whenTargetNamed('basic');
            }
        }

        if (options.swagger !== false) {
            this._instance.register(SwaggerGenerator.getPlugin, {
                configuration: typeof (options.swagger) === 'boolean' ? undefined : options.swagger,
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

export interface ServerOptions extends FastifyServerOptions {
    container: Container;
    metrics?: boolean | string;
    admin?: boolean | AdminOptions;
    healthcheck?: boolean;
    swagger?: boolean | OpenApiConf;
    mongo?: boolean | MongoOptions;
    auth?: {
        jwt?: boolean | JwtAuthProviderOptions,
        basic?: boolean | BasicAuthProviderOptions,
    };
    onInit?: (instance: Instance) => void;
    compressOptions?: FastifyCompressOptions;
}

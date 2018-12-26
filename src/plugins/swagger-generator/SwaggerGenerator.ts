import {FastifyInstance} from 'fastify';
import fastifyStatic from 'fastify-static';
import {Container} from 'inversify';
import mixin from 'mixin-deep';
import swaggerUiDist from 'swagger-ui-dist';
import {AuthProvider} from '../../auth/AuthProvider';
import {AuthUtil} from '../../auth/AuthUtil';
import {BasicAuthProvider} from '../../auth/BasicAuthProvider';
import {JwtAuthProvider} from '../../auth/JwtAuthProvider';
import {loggerService} from '../../core/loggerService';
import {Reply, Request, types} from '../../types';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import {ParamOptions} from '../common/param/ParamOptions';
import {OPENAPI_DEFAULT_CONFIGURATION, OpenApiConf} from './models/OpenApiConf';
import {OpenApiMethod} from './models/OpenApiMethod';
import {SwaggerTipifyUtil} from './SwaggerTipifyUtil';

export class SwaggerGenerator {

    /**
     * Index.html template
     * @type {string}
     */
    public static INDEX_HTML_TEMPLATE = '<!DOCTYPE html>\n' +
        '<html lang="en">\n' +
        '  <head>\n' +
        '    <meta charset="UTF-8">\n' +
        '    <title>SwaggerPlugin UI</title>\n' +
        '    <link rel="stylesheet" type="text/css" href="./docs/swagger-ui.css" >\n' +
        '    <link rel="icon" type="image/png" href="./docs/favicon-32x32.png" sizes="32x32" />\n' +
        '    <link rel="icon" type="image/png" href="./docs/favicon-16x16.png" sizes="16x16" />\n' +
        '    <style>\n' +
        '      html\n' +
        '      {\n' +
        '        box-sizing: border-box;\n' +
        '        overflow: -moz-scrollbars-vertical;\n' +
        '        overflow-y: scroll;\n' +
        '      }\n' +
        '\n' +
        '      *,\n' +
        '      *:before,\n' +
        '      *:after\n' +
        '      {\n' +
        '        box-sizing: inherit;\n' +
        '      }\n' +
        '\n' +
        '      body\n' +
        '      {\n' +
        '        margin:0;\n' +
        '        background: #fafafa;\n' +
        '      }\n' +
        '    </style>\n' +
        '  </head>\n' +
        '\n' +
        '  <body>\n' +
        '    <div id="swagger-ui"></div>\n' +
        '\n' +
        '    <script src="./docs/swagger-ui-bundle.js"> </script>\n' +
        '    <script src="./docs/swagger-ui-standalone-preset.js"> </script>\n' +
        '    <script>\n' +
        '    window.onload = function() {\n' +
        '      const ui = SwaggerUIBundle({\n' +
        '        url: "./docs/swagger.json",\n' +
        '        dom_id: \'#swagger-ui\',\n' +
        '        oauth2RedirectUrl: window.location.origin + \'/docs/oauth2-redirect.html\',\n' +
        '        deepLinking: true,\n' +
        '        presets: [\n' +
        '          SwaggerUIBundle.presets.apis\n' +
        '        ],\n' +
        '        plugins: [\n' +
        '        ]\n' +
        '      })\n' +
        '      window.ui = ui\n' +
        '    }\n' +
        '  </script>\n' +
        '  </body>\n' +
        '</html>\n';

    /**
     * Translate url
     * /user/:name -> /user/{name}
     * @param {string} url
     * @returns {string}
     */
    public static translateUrl(url: string): string {
        return url ? url.replace(/:(\w+)/g, '{$1}') : '';
    }

    /**
     * Build open API configuration
     * @param {Container} container
     * @param {OpenApiConf} userDefinedConfiguration
     * @returns {OpenApiConf}
     */
    public static buildConfiguration(container: Container, userDefinedConfiguration?: OpenApiConf): OpenApiConf {

        const logger = SwaggerGenerator.logger.child({method: 'buildConfiguration'});

        let configuration = OPENAPI_DEFAULT_CONFIGURATION;

        SwaggerGenerator.buildAuthenticationConfiguration(container, configuration);

        CommonUtil.getAllEndpoints(container).forEach(
            (endpoint) => {
                configuration = mixin(configuration, SwaggerGenerator.buildConfigurationForEndpoint(endpoint));
            });

        if (userDefinedConfiguration) {
            configuration = mixin(configuration, userDefinedConfiguration);
        }

        logger.debug('open api configuration built');

        return configuration;
    }

    /**
     * Build authentication configuration
     * @param {Container} container
     * @param {OpenApiConf} configuration
     * @returns {OpenApiConf}
     */
    public static buildAuthenticationConfiguration(container: Container, configuration?: OpenApiConf): OpenApiConf {

        const authenticationProviders = container.isBound(types.AuthProvider)
            ? container.getAll<AuthProvider>(types.AuthProvider) : [];

        authenticationProviders.forEach((provider) => {

            if (provider instanceof JwtAuthProvider) {

                const authConfiguration: OpenApiConf = {
                    components: {
                        securitySchemes: {
                            jwt: {
                                flows: {
                                    implicit: {
                                        authorizationUrl: provider.options.authorizationUrl,
                                        scopes: {},
                                    },
                                },
                                type: 'oauth2',
                            },
                        },
                    },
                };
                configuration = mixin(configuration, authConfiguration);

            } else if (provider instanceof BasicAuthProvider) {

                const authConfiguration: OpenApiConf = {
                    components: {
                        securitySchemes: {
                            basic: {
                                scheme: 'basic',
                                type: 'http',
                            },
                        },
                    },
                };
                configuration = mixin(configuration, authConfiguration);

            } else {
                throw new Error('swagger generator cannot implement authentication');
            }
        });

        return configuration;
    }

    /**
     * Build open API configuration for a parameter
     * @param {OpenApiConf} configuration
     * @param {OpenApiMethod} methodOptions
     * @param {ParamOptions} paramOptions
     * @returns {OpenApiConf}
     */
    public static buildConfigurationForParameter(
        configuration: OpenApiConf,
        methodOptions: OpenApiMethod,
        paramOptions: ParamOptions): OpenApiConf {

        switch (paramOptions.type) {

            /**
             * Query param
             */
            case 'query':
                methodOptions.parameters.push({
                    in: 'query',
                    name: paramOptions.name,
                    schema: {
                        type: 'string',
                    },
                });
                break;

            /**
             * Query search
             */
            case 'search':
                methodOptions.parameters.push(
                    {
                        in: 'query',
                        name: 'offset',
                        schema: {
                            type: 'integer',
                        },
                    },
                    {
                        in: 'query',
                        name: 'limit',
                        schema: {
                            type: 'integer',
                        },
                    },
                    {
                        description: 'Filter by entering {field}[eq]={value}',
                        explode: true,
                        in: 'query',
                        name: 'filter',
                        schema: {
                            items: {
                                type: 'string',
                            },
                            type: 'array',
                        },
                    },
                    {
                        description: 'Sort by entering {field}={ASC|DESC}',
                        explode: true,
                        in: 'query',
                        name: 'sort',
                        schema: {
                            items: {
                                type: 'string',
                            },
                            type: 'array',
                        },
                    });
                break;

            /**
             * Path param
             */
            case 'path':
                methodOptions.parameters.push({
                    in: 'path',
                    name: paramOptions.name,
                    schema: {
                        type: 'string',
                    },
                });
                break;

            /**
             * Body
             */
            case 'body':
                const paramType = paramOptions.paramType;

                const contentType = 'application/json';

                const requestBody = {
                    content: {
                        [contentType]: {
                            schema: SwaggerTipifyUtil.buildOpenApiSchema(paramType, configuration.components.schemas),
                        },
                    },
                    description: paramOptions.description,
                    required: true,
                };

                methodOptions.requestBody = requestBody;
                break;
        }

        return configuration;
    }

    /**
     * build open API configuration for an endpoint
     * @param {WireupEndpoint} endpoint
     * @returns {OpenApiConf}
     */
    public static buildConfigurationForEndpoint(endpoint: WireupEndpoint): OpenApiConf {

        const logger = SwaggerGenerator.logger.child({method: 'buildConfigurationForEndpoint'});

        const url = SwaggerGenerator.translateUrl(endpoint.url);
        const method = endpoint.methodOptions.method.toLowerCase();

        let endpointConfiguration: OpenApiMethod = {
            parameters: [],
        };

        if (endpoint.controllerOptions.swagger) {
            logger.trace('merging endpoint configuration with user defined configuration (controller)');
            endpointConfiguration = mixin(endpointConfiguration, endpoint.controllerOptions.swagger);
        }

        const auth = endpoint.methodOptions.auth;
        if (auth) {
            logger.trace('authentication enabled');

            endpointConfiguration.security = AuthUtil.normalizeAuthOptions(auth)
                .map((a) => {
                    logger.trace(`authentication <${a.providerName}> enabled`);
                    return {[a.providerName]: []};
                });
        }

        let configuration: OpenApiConf = {
            components: {
                schemas: {},
            },
            paths: {
                [url]: {
                    [method]: endpointConfiguration,
                },
            },
        };

        endpoint.paramsOptions.forEach((param) => {
            configuration = SwaggerGenerator.buildConfigurationForParameter(configuration, endpointConfiguration, param);
        });

        if (endpoint.methodOptions.swagger) {
            logger.trace('merging endpoint configuration with user defined configuration');
            configuration.paths[url][method] = mixin(configuration.paths[url][method], endpoint.methodOptions.swagger);
        }

        if (!configuration.paths[url][method].responses) {
            logger.trace('adding default responses');
            configuration.paths[url][method].responses = {
                200: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                            },
                        },
                        'application/x-yaml': {
                            schema: {
                                type: 'object',
                            },
                        },
                    },
                },
            };
        }

        return configuration;
    }

    /**
     * Get swagge generator plugin
     * @param {fastify.FastifyInstance} instance
     * @param {{container: Container; configuration: OpenApiConf}} opts
     * @param {(err?: Error) => void} next
     */
    public static getPlugin(
        instance: FastifyInstance,
        opts: { container: Container, configuration: OpenApiConf },
        next: (err?: Error) => void) {

        const logger = SwaggerGenerator.logger.child({method: 'getPlugin'});

        logger.info('initializing swagger...');
        let configuration = SwaggerGenerator.buildConfiguration(opts.container);
        if (opts.configuration) {
            configuration = mixin(configuration, opts.configuration);
        }

        const index = SwaggerGenerator.INDEX_HTML_TEMPLATE;

        /**
         * Serve api.ts.html
         */
        instance.get('/docs', (request: Request, reply: Reply) => {
            reply.type('text/html').send(index);
        });

        /**
         * Serve swagger.json
         */
        instance.get('/docs/swagger.json', (request: Request, reply: Reply) => {
            reply.send(configuration);
        });

        /**
         * Serve swagger static assets
         */
        instance.register(fastifyStatic, {
            index: false,
            prefix: '/docs',
            root: swaggerUiDist.getAbsoluteFSPath(),
        });

        logger.info('swagger initialized');
        next();
    }

    private static logger = loggerService.child({module: 'SwaggerGenerator'});
}

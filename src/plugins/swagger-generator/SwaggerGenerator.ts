import {FastifyInstance} from 'fastify';
import fastifyStatic from 'fastify-static';
import {Container} from 'inversify';
import mixin from 'mixin-deep';
import swaggerUiDist from 'swagger-ui-dist';
import {Reply, Request} from '../../Types';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import {ParamOptions} from '../common/param/ParamOptions';
import {OpenApiConf} from './models/OpenApiConf';
import {OpenApiMethod} from './models/OpenApiMethod';
import {SwaggerTipifyUtil} from './SwaggerTipifyUtil';

export class SwaggerGenerator {

    /**
     * Open API default configuration
     * @type {{openapi: string}}
     */
    public static DEFAULT_OPENAPI_CONFIGURATION: OpenApiConf = {
        openapi: '3.0.0',
    };

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
        '        deepLinking: true,\n' +
        '        presets: [\n' +
        '          SwaggerUIBundle.presets.apis,\n' +
        '          SwaggerUIStandalonePreset\n' +
        '        ],\n' +
        '        plugins: [\n' +
        '          SwaggerUIBundle.plugins.DownloadUrl\n' +
        '        ],\n' +
        '        layout: "StandaloneLayout"\n' +
        '      })\n' +
        '      window.ui = ui\n' +
        '    }\n' +
        '  </script>\n' +
        '  </body>\n' +
        '</html>\n';

    /**
     * Build index.html
     * @returns {string}
     */
    public static buildIndex(): string {
        return SwaggerGenerator.INDEX_HTML_TEMPLATE;
    }

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

        let configuration = SwaggerGenerator.DEFAULT_OPENAPI_CONFIGURATION;

        CommonUtil.getAllEndpoints(container).forEach(
            (endpoint) => {
                configuration = mixin(configuration, SwaggerGenerator.buildConfigurationForEndpoint(endpoint));
            });

        if (userDefinedConfiguration) {
            configuration = mixin(configuration, userDefinedConfiguration);
        }

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

                if (!configuration.components) {
                    configuration.components = {schemas: {}};
                }

                if (!configuration.components.schemas) {
                    configuration.components.schemas = {};
                }

                configuration.components.schemas = SwaggerTipifyUtil.buildOpenAPISchema(paramType, configuration.components.schemas);

                const contentType = 'application/json';

                const requestBody = {
                    description: paramOptions.description,
                    required: true,
                    content: {
                        [contentType]: {
                            schema: {
                                $ref: `#components/schemas/${paramOptions.paramType.name}`,
                            },
                        },
                    },
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

        const url = SwaggerGenerator.translateUrl(endpoint.url);
        const method = endpoint.methodOptions.method.toLowerCase();

        const endpointConfiguration: OpenApiMethod = {
            parameters: [],
        };

        let configuration: OpenApiConf = {
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
            configuration.paths[url][method] = mixin(configuration.paths[url][method], endpoint.methodOptions.swagger);
        }

        return configuration;
    }

    /**
     * Get swagger generator plugin
     * @param {fastify.FastifyInstance} instance
     * @param {{container: Container}} opts
     * @param {(err?: Error) => void} next
     */
    public static getPlugin(instance: FastifyInstance, opts: { container: Container }, next: (err?: Error) => void) {

        const logger = instance.log.child({module: 'swaggerGenerator'});

        logger.info('initializing swagger...');
        const configuration = SwaggerGenerator.buildConfiguration(opts.container);
        const index = SwaggerGenerator.buildIndex();

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
            root: swaggerUiDist.getAbsoluteFSPath(),
            prefix: '/docs',
            index: false,
        });

        logger.info('swagger initialized');
        next();
    }
}

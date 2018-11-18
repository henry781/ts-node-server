import {FastifyInstance} from 'fastify';
import fastifyStatic from 'fastify-static';
import {Container} from 'inversify';
import mixin from 'mixin-deep';
import swaggerUiDist from 'swagger-ui-dist';
import {ParamOptions} from '../../core/param/ParamOptions';
import {ExploredMethod, ServerUtil} from '../../core/ServerUtil';
import {Reply, Request} from '../../Types';
import {SwaggerConf} from './SwaggerConf';
import {SwaggerMethodParameterConf} from './SwaggerMethodParameterConf';

const SWAGGER_URL_PATH_PARAM_REGEX = /:(\w+)/g;

const INDEX_HTML_TEMPLATE = '<!DOCTYPE html>\n' +
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

function buildSwaggerUrl(url: string) {
    return url.replace(SWAGGER_URL_PATH_PARAM_REGEX, '{$1}');
}

function buildSwaggerParameterConfiguration(paramOptions: ParamOptions): SwaggerMethodParameterConf {
    switch (paramOptions.type) {
        case 'query':
            return {
                in: 'query',
                name: paramOptions.name,
                schema: {
                    type: 'string',
                },
            };
        case 'path':
            return {
                in: 'path',
                name: paramOptions.name,
                schema: {
                    type: 'string',
                },
            };
        default:
            return undefined;
    }
}

function buildSwaggerConfigurationForMethod(exploredMethod: ExploredMethod): SwaggerConf {

    const url = buildSwaggerUrl(exploredMethod.url);
    const method = exploredMethod.methodOptions.method.toLowerCase();
    const params = exploredMethod.paramsOptions.map((p) => buildSwaggerParameterConfiguration(p)).filter((p) => p);

    let configuration: SwaggerConf = {
        paths: {
            [url]: {
                [method]: {
                    parameters: params,
                },
            },
        },
    };

    if (exploredMethod.methodOptions.swagger) {
        const overridenConfiguration: SwaggerConf = {
            paths: {
                [url]: {
                    [method]: exploredMethod.methodOptions.swagger,
                },
            },
        };

        configuration = mixin(configuration, overridenConfiguration);
    }

    return configuration;
}

/**
 * Swagger plugin
 * @param {fastify.FastifyInstance} instance
 * @param {{container: Container}} opts
 * @param {(err?: Error) => void} next
 */
export function swaggerPlugin(instance: FastifyInstance, opts: { container: Container }, next: (err?: Error) => void) {

    const logger = instance.log.child({module: 'swaggerPlugin'});

    logger.info('initializing swagger...');

    let configuration: SwaggerConf = {
        openapi: '3.0.0',
    };

    ServerUtil.exploreMethods(opts.container,
        (m) => {
            logger.trace(`building configuration for [${m.methodOptions.method}] ${m.url}...`);
            configuration = mixin(configuration, buildSwaggerConfigurationForMethod(m));
        });

    /**
     * Serve index.ts.html
     */
    instance.get('/docs', (request: Request, reply: Reply) => {
        reply.type('text/html').send(INDEX_HTML_TEMPLATE);
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

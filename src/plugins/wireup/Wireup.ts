import * as _accepts from 'accepts';
import {FastifyInstance} from 'fastify';
import * as _flatstr from 'flatstr';
import {Container} from 'inversify';
import * as _yaml from 'js-yaml';
import {JsonConverterMapper} from 'tipify';
import {AuthUtil} from '../../auth/AuthUtil';
import {JsonConverter} from '../../json/JsonConverter';
import {Reply, Request} from '../../types';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';

const accepts = _accepts;
const flatstr = _flatstr;
const yaml = _yaml;

/**
 * Wireup plugin
 */
export class Wireup {

    /**
     * Get handler
     * @param {WireupEndpoint} endpoint
     * @returns {(request: Request, reply: Reply) => Promise<any>}
     */
    public static getHandler(endpoint: WireupEndpoint) {

        return async (request: Request, reply: Reply) => {

            const args = endpoint.paramsOptions.map((param) => {

                switch (param.type) {
                    case 'query':
                        return request.query[param.name];
                    case 'path':
                        return request.params[param.name];
                    case 'body':
                        return JsonConverter.deserialize(request.body, param.paramType);
                    case 'httpRequest':
                        return request;
                    case 'httpReply':
                        return reply;
                    case 'auth':
                        return request.user;
                    default:
                        return undefined;
                }
            });

            return endpoint.controller[endpoint.method].apply(endpoint.controller, args);
        };
    }

    /**
     * Get authorization handler
     * @param {Container} container
     * @param {WireupEndpoint} endpoint
     * @returns {any}
     */
    public static getAuthorizationHandler(container: Container, endpoint: WireupEndpoint) {

        function sendUnauthorized(reply: Reply) {
            reply.status(401).send('Unauthorized');
        }

        if (!endpoint.methodOptions.auth) {
            return;
        }

        const normalizedAuthOptions = AuthUtil.normalizeAuthOptions(endpoint.methodOptions.auth);
        const providersByScheme = AuthUtil.getAuthProvidersByScheme(container, normalizedAuthOptions);

        return (request: Request, reply: Reply, done) => {

            const token = AuthUtil.parseAuthorizationHeader(request);

            if (!token || !token.scheme) {
                sendUnauthorized(reply);
                done();
                return;
            }

            const auth = providersByScheme[token.scheme.toLowerCase()];

            if (!auth || !auth.provider) {
                sendUnauthorized(reply);
                done();
                return;
            }

            try {
                request.user = auth.provider.authenticate(token, auth.options);
            } catch (err) {
                sendUnauthorized(reply);
            }
            done();
            return;
        };
    }

    public static getJsonSerializer() {

        return (data) => {

            let json = data;
            const isMapped = data && JsonConverterMapper.getMappingForType(data.constructor);
            if (isMapped) {
                json = JsonConverter.serialize(data);
            }

            return flatstr(JSON.stringify(json));
        };
    }

    public static getYamlSerializer() {

        return (data) => {

            let json = data;
            const isMapped = data && JsonConverterMapper.getMappingForType(data.constructor);
            if (isMapped) {
                json = JsonConverter.serialize(data);
            }

            return flatstr(yaml.safeDump(json));
        };

    }

    public static getSerializerHandler() {

        return (request: Request, reply: Reply, done) => {

            const accept = accepts(request as any);

            switch (accept.type(['json', 'yaml'])) {
                case 'json':
                    reply.header('Content-Type', 'application/json')
                        .serializer(Wireup.getJsonSerializer());
                    break;
                case 'yaml':
                    reply.header('Content-Type', 'application/x-yaml')
                        .serializer(Wireup.getYamlSerializer());
                    break;
            }
            done();
        };
    }

    /**
     * Get wireup plugin
     * @param {fastify.FastifyInstance} instance
     * @param {{container: Container}} opts
     * @param {(err?: Error) => void} next
     */
    public static getPlugin(
        instance: FastifyInstance,
        opts: { container: Container },
        next: (err?: Error) => void) {

        const logger = instance.log.child({module: 'wireupPlugin'});

        logger.info('initializing wireup...');

        CommonUtil.getAllEndpoints(opts.container).forEach(
            (endpoint) => {

                instance.route({
                    beforeHandler: [
                        Wireup.getAuthorizationHandler(opts.container, endpoint),
                        Wireup.getSerializerHandler()]
                        .filter((handler) => handler !== undefined),
                    handler: Wireup.getHandler(endpoint),
                    method: endpoint.methodOptions.method,
                    url: endpoint.url,
                });
                logger.debug(`[${endpoint.methodOptions.method}] ${endpoint.url}`);
            });

        logger.info('wireup initialized');
        next();
    }
}

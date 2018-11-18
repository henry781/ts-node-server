import {RouteShorthandOptions} from 'fastify';
import {SwaggerMethodConf} from '../../plugins/swagger/SwaggerMethodConf';

export interface GenericMethodOptions {
    url?: string;
    options?: RouteShorthandOptions;
    swagger?: SwaggerMethodConf;
}

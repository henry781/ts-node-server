import {RouteShorthandOptions} from 'fastify';
import {OpenApiMethod} from '../../api';

export interface GenericMethodOptions {
    url?: string;
    options?: RouteShorthandOptions;
    swagger?: OpenApiMethod;
}

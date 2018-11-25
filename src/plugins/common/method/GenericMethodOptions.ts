import {RouteShorthandOptions} from 'fastify';
import {OpenApiMethod} from '../../api';
import {AuthOptions} from './AuthOptions';

export interface GenericMethodOptions {
    url?: string;
    options?: RouteShorthandOptions;
    swagger?: OpenApiMethod;
    auth?: string | string[] | { [provider: string]: AuthOptions };
}

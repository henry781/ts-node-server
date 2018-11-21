import {HTTPMethod} from 'fastify';
import {GenericMethodOptions} from './GenericMethodOptions';

export interface MethodOptions extends GenericMethodOptions {
    method: HTTPMethod;
}

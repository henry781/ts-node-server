import {HTTPMethod} from 'fastify';
import 'reflect-metadata';
import {GenericMethodOptions} from './GenericMethodOptions';
import {MethodOptions} from './MethodOptions';

export const ROUTE_METHOD = Symbol('route:method');

/**
 * Http decorator
 * @param {MethodOptions} options
 * @returns {(target: object, propertyKey: string) => void}
 */
export function http(options: MethodOptions) {

    return (target: object, propertyKey: string) => {
        Reflect.defineMetadata(ROUTE_METHOD, options, target, propertyKey);
    };
}

/**
 * HttpGet decorator
 * @param {string | GenericMethodOptions} options
 * @returns {(target: object, propertyKey: string) => void}
 */
export function httpGet(options?: string | GenericMethodOptions) {

    if (!options) {
        options = {};

    } else if (typeof(options) === 'string') {
        options = {
            url: options as string,
        };
    }

    return http(Object.assign(options, {method: 'GET' as HTTPMethod}));
}

/**
 * HttpPost decorator
 * @param {string | GenericMethodOptions} options
 * @returns {(target: object, propertyKey: string) => void}
 */
export function httpPost(options?: string | GenericMethodOptions) {

    if (!options) {
        options = {};

    } else if (typeof(options) === 'string') {
        options = {
            url: options as string,
        };
    }

    return http(Object.assign(options ? options : {}, {method: 'POST' as HTTPMethod}));
}

/**
 * HttpPut decorator
 * @param {string | GenericMethodOptions} options
 * @returns {(target: object, propertyKey: string) => void}
 */
export function httpPut(options?: string | GenericMethodOptions) {

    if (!options) {
        options = {};

    } else if (typeof(options) === 'string') {
        options = {
            url: options as string,
        };
    }

    return http(Object.assign(options, {method: 'PUT' as HTTPMethod}));
}

/**
 * HttpPatch decorator
 * @param {string | GenericMethodOptions} options
 * @returns {(target: object, propertyKey: string) => void}
 */
export function httpPatch(options?: string | GenericMethodOptions) {

    if (!options) {
        options = {};

    } else if (typeof(options) === 'string') {
        options = {
            url: options as string,
        };
    }

    return http(Object.assign(options, {method: 'PATCH' as HTTPMethod}));
}

/**
 * HttpDelete decorator
 * @param {string | GenericMethodOptions} options
 * @returns {(target: object, propertyKey: string) => void}
 */
export function httpDelete(options?: string | GenericMethodOptions) {

    if (!options) {
        options = {};

    } else if (typeof(options) === 'string') {
        options = {
            url: options as string,
        };
    }

    return http(Object.assign(options, {method: 'DELETE' as HTTPMethod}));
}

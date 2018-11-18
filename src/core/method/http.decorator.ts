import {HTTPMethod} from 'fastify';
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
    }
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
            url: <string>options
        };
    }

    return http(Object.assign(options, {method: <HTTPMethod>'GET'}));
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
            url: <string>options
        };
    }

    return http(Object.assign(options ? options : {}, {method: <HTTPMethod>'POST'}));
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
            url: <string>options
        };
    }

    return http(Object.assign(options, {method: <HTTPMethod>'PUT'}));
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
            url: <string>options
        };
    }

    return http(Object.assign(options, {method: <HTTPMethod>'PATCH'}));
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
            url: <string>options
        };
    }

    return http(Object.assign(options, {method: <HTTPMethod>'DELETE'}));
}
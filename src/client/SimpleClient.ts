import * as authHeader from 'auth-header';
import {TokenOptions} from 'auth-header';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {Logger} from 'pino';
import {Principal} from '../auth/Principal';
import {jsonConverter} from '../core/jsonConverter';
import {getLogger, getReqId} from '../logger/loggerService';

declare module 'axios' {
    export interface AxiosRequestConfig {
        logger?: Logger,
        token?: string;
        principal?: Principal;
        serializer?: boolean | Converter;
        deserializer?: Converter;
        deserializeType?: any;
    }
}

type Converter = (obj: any) => any;

export const simpleClient = axios.create();

simpleClient.interceptors.request.use((config) => {
    config = normalizeConfig(config);
    logRequest(config);
    return config;
}, (error) => {
    return Promise.reject(error);
});

simpleClient.interceptors.response.use((response) => {
    logResponse(response);
    return response;
}, (error) => {
    return Promise.reject(error);
});

export function logRequest(config: AxiosRequestConfig) {
    let logger = config.logger;
    if (!logger) {
        logger = getLogger('simpleClient');
    }
    logger.debug({
        http: {
            baseUrl: config.baseURL,
            url: config.url,
            method: config.method
        }
    }, 'New request');
}

export function logResponse(response: AxiosResponse) {
    let logger = response.config.logger;
    if (!logger) {
        logger = getLogger('simpleClient');
    }
    logger.info({
        http: {
            baseUrl: response.config.baseURL,
            url: response.config.url,
            method: response.config.method,
            status: response.status,
            statusText: response.statusText
        }
    }, 'Response received');
    logger.trace({data: response.data}, 'Data received');
}

export function normalizeConfig(config: AxiosRequestConfig): AxiosRequestConfig {

    if (!config.headers) {
        config.headers = {};
    }

    const reqId = getReqId();
    if (reqId) {
        config.headers['request-id'] = reqId;
    }

    const principal = config.principal;
    if (principal) {
        config.headers.Authorization = authHeader.format(principal.token as TokenOptions);
        if (principal.params && principal.params.clientHeaders) {
            config.headers = {
                ...principal.params.clientHeaders,
                ...config.headers,
            };
        }
    }

    if (config.token) {
        config.headers.Authorization = config.token;
    }

    if (config.serializer !== false) {
        config.transformRequest = [data => jsonConverter.serialize(data, undefined, {unsafe: true})];
    } else if (typeof (config.serializer) === 'function') {
        config.transformRequest = [data => JSON.stringify((config.serializer as Converter)(data))];
    }

    if (config.deserializeType) {
        config.transformResponse = [data => jsonConverter.deserialize(JSON.parse(data), config.deserializeType)];
    } else if (config.deserializer) {
        config.transformResponse = [data => config.deserializer(JSON.parse(data))];
    }

    return config;
}

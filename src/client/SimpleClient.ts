import * as authHeader from 'auth-header';
import {TokenOptions} from 'auth-header';
import {injectable} from 'inversify';
import fetch, {RequestInit, Response} from 'node-fetch';
import {Principal} from '../auth/Principal';
import {jsonConverter} from '../core/jsonConverter';
import {getLogger, getReqId} from '../logger/loggerService';
import {SimpleClientError} from './SimpleClientError';

@injectable()
export class SimpleClient {

    public async get(uri: string, options: ResponseOptions): Promise<Response>;
    public async get<T>(uri: string, options: JsonOptions): Promise<T>;
    public async get<T>(uri: string, options: Options): Promise<T | Response> {
        return this.http<T>(uri, 'get', options as any);
    }

    public async post(uri: string, options: ResponseOptions): Promise<Response>;
    public async post<T>(uri: string, options: JsonOptions): Promise<T>;
    public async post<T>(uri: string, options: Options): Promise<T | Response> {
        return this.http<T>(uri, 'post', options as any);
    }

    public async delete(uri: string, options: ResponseOptions): Promise<Response>;
    public async delete<T>(uri: string, options: JsonOptions): Promise<T>;
    public async delete<T>(uri: string, options: Options): Promise<T | Response> {
        return this.http<T>(uri, 'delete', options as any);
    }

    public async put(uri: string, options: ResponseOptions): Promise<Response>;
    public async put<T>(uri: string, options: JsonOptions): Promise<T>;
    public async put<T>(uri: string, options: Options): Promise<T | Response> {
        return this.http<T>(uri, 'put', options as any);
    }

    public async patch(uri: string, options: ResponseOptions): Promise<Response>;
    public async patch<T>(uri: string, options: JsonOptions): Promise<T>;
    public async patch<T>(uri: string, options: Options): Promise<T | Response> {
        return this.http<T>(uri, 'patch', options as any);
    }

    public async http(uri: string, method: Method, options: ResponseOptions): Promise<Response>;
    public async http<T>(uri: string, method: Method, options: JsonOptions): Promise<T>;
    public async http<T>(uri: string, method: Method, options: Options): Promise<T | Response> {
        const logger = getLogger('http', this);

        const requestInit = this.buildFetchOptionsInit(method, options);

        let response: Response;
        try {
            response = await fetch(uri, requestInit);
        } catch (e) {
            const msg = 'fail to execute request : ' + e.message;
            logger.error(msg);
            throw new SimpleClientError(msg, 500, e);
        }

        const expectedStatus = options.expectedStatus ? options.expectedStatus : 200;
        if (response.status !== expectedStatus) {
            const msg = `expecting status <${expectedStatus}> calling <${uri}>, got <${response.status}>`;
            logger.error(msg);
            const text = await response.text();
            let responseBody = text;
            try {
                responseBody = JSON.parse(text);
            } catch (e) {
                logger.debug('cannot deserialize body');
            }
            logger.debug('got body', responseBody);
            throw new SimpleClientError(msg, 500, undefined, response.status, responseBody);
        }

        if (options.mode === 'json') {
            const jsonOptions = options as JsonOptions;
            if (jsonOptions.deserializer) {
                return (jsonOptions.deserializer(await response.json()));
            } else if (jsonOptions.deserializeType) {
                return jsonConverter.deserialize(await response.json(), jsonOptions.deserializeType);
            } else {
                return response.json();
            }
        }

        return response;
    }

    public buildFetchOptionsInit(method: string, options: Options): RequestInit {

        const logger = getLogger('buildHttpOptions', this);

        let headers: { [key: string]: string } = {
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
        };
        let body: any;

        // append request id
        const reqId = getReqId();
        if (reqId) {
            headers['request-id'] = reqId;
        }

        // append authorization header
        if (options.token) {
            logger.debug('setting authorization header from given token');
            headers.Authorization = options.token;
        } else if (options.principal && options.principal.token) {
            logger.debug('setting authorization header from give principal');
            headers.Authorization = authHeader.format(options.principal.token as TokenOptions);
        }

        // append client headers from principal
        if (options.principal && options.principal.params && options.principal.params.clientHeaders) {
            headers = {
                ...options.principal.params.clientHeaders,
                ...headers,
            };
        }

        // setting json body
        if (options.json) {
            logger.debug('setting json body');
            headers['Content-Type'] = 'application/json';
            headers.Accept = 'application/json';

            if (options.serializer === false) {
                body = JSON.stringify(options.json);
            } else if (typeof (options.serializer) === 'function') {
                logger.debug('serializing body');
                body = JSON.stringify(options.serializer(options.json));
            } else {
                body = jsonConverter.serialize(options.json, undefined, {unsafe: true});
            }
        }

        // setting form body
        if (options.form) {
            logger.debug('setting form body');
            body = new URLSearchParams(options.form);
        }

        // build request init
        let requestInit: RequestInit = {body, method};
        if (options.fetchOptions) {
            requestInit = {...requestInit, ...options.fetchOptions};
        }
        if (requestInit.headers) {
            requestInit.headers = {...headers, ...requestInit.headers};
        } else {
            requestInit.headers = headers;
        }

        return requestInit;
    }
}

type Converter = (obj: any) => any;
type Mode = 'response' | 'json';
type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

interface Options {
    principal?: Principal;
    token?: string;
    fetchOptions?: RequestInit;
    expectedStatus?: number;
    mode: Mode;
    json?: any;
    form?: { [key: string]: string }
    serializer?: boolean | Converter;
}

export interface ResponseOptions extends Options {
    principal?: Principal;
    token?: string;
    httpOptions?: RequestInit;
    expectedStatus?: number;
    mode: 'response';
}

export interface JsonOptions extends Options {
    deserializer?: Converter;
    deserializeType?: any;
    mode: 'json';
}

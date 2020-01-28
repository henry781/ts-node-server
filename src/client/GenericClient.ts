import * as authHeader from 'auth-header';
import {TokenOptions} from 'auth-header';
import {injectable} from 'inversify';
import * as _request from 'request';
import {CoreOptions} from 'request';
import {Principal} from '../auth/Principal';
import {jsonConverter} from '../core/jsonConverter';
import {getLogger, getReqId} from '../logger/loggerService';
import {GenericClientError} from './GenericClientError';

@injectable()
export abstract class GenericClient {

    protected request = _request;

    /**
     * Constructor
     */
    constructor() {
    }

    /**
     * Get request
     * @param uri
     * @param options
     */
    protected get<T>(uri: string, options: RequestOptions<T>): Promise<T> {
        return this.http(uri, options, 'get');
    }

    /**
     * Post request
     * @param uri
     * @param options
     */
    protected post<T>(uri: string, options: RequestOptions<T>): Promise<T> {
        return this.http(uri, options, 'post');
    }

    /**
     * Delete request
     * @param uri
     * @param options
     */
    protected delete<T>(uri: string, options: RequestOptions<T>): Promise<T> {
        return this.http(uri, options, 'delete');
    }

    /**
     * Put request
     * @param uri
     * @param options
     */
    protected put<T>(uri: string, options: RequestOptions<T>): Promise<T> {
        return this.http(uri, options, 'put');
    }

    /**
     * Patch request
     * @param uri
     * @param options
     */
    protected patch<T>(uri: string, options: RequestOptions<T>): Promise<T> {
        return this.http(uri, options, 'patch');
    }

    /**
     * Build HttpOptions
     * @param options
     * @param method
     */
    protected buildHttpOptions<T>(options: RequestOptions<T>, method: string): CoreOptions {

        const logger = getLogger('buildHttpOptions', this);

        const httpOptions: CoreOptions = {
            headers: {},
            json: true,
            method,
        };

        const reqId = getReqId();
        if (reqId) {
            httpOptions.headers['request-id'] = reqId;
        }

        if (options.httpOptions) {
            logger.debug('override httpOptions');
            Object.assign(httpOptions, options.httpOptions);
            logger.debug('got httpOptions', httpOptions);
        }

        if (options.token) {
            logger.debug('setting authorization header from given token');
            httpOptions.headers.Authorization = options.token;
        } else if (options.principal && options.principal.token) {
            logger.debug('setting authorization header from give principal');
            httpOptions.headers.Authorization = authHeader.format(options.principal.token as TokenOptions);
        }

        if (options.body) {
            logger.debug('setting body');

            if (options.serializer === false) {
                httpOptions.body = options.body;

            } else if (typeof (options.serializer) === 'function') {
                logger.debug('serializing body');
                httpOptions.body = options.serializer(options.body);

            } else {
                httpOptions.body = jsonConverter.serialize(options.body, undefined, {unsafe: true});
            }
        }

        return httpOptions;
    }

    /**
     * Http request
     * @param uri
     * @param options
     * @param method
     */
    protected http<T>(uri: string, options: RequestOptions<T>, method: string): Promise<T> {

        const logger = getLogger('http', this);

        logger.debug(`requesting <${uri}>`);
        const httpOptions = this.buildHttpOptions(options, method);

        return new Promise((resolve, reject) => {
            this.request(uri, httpOptions, (err, response, body) => {

                if (err) {
                    logger.error(`error calling <${uri}> :`, err);
                    const error = new GenericClientError(`error calling <${uri}>`, 500, err, response, body);
                    reject(error);

                } else {

                    logger.debug(`request on <${uri}> complete`);
                    if (response.statusCode !== options.expectedStatus) {
                        const msg = `expecting status <${options.expectedStatus}> calling <${uri}>, got <${response.statusCode}>`;
                        logger.error(msg);
                        logger.debug('got body', body);
                        const error = new GenericClientError(msg, 500, undefined, response, body);
                        reject(error);

                    } else {

                        if (options.deserializer === false) {
                            resolve(body);

                        } else if (typeof (options.deserializer) === 'function') {
                            resolve(options.deserializer(body));

                        } else if (options.deserializeType) {
                            resolve(jsonConverter.deserialize(body, options.deserializeType));

                        } else {
                            resolve();
                        }
                    }
                }
            });
        });
    }
}

type converter = (obj: any) => any;

export interface RequestOptions<T> {

    principal?: Principal;
    token?: string;
    httpOptions?: CoreOptions;
    serializer?: boolean | converter;
    deserializer?: boolean | converter;
    body?: any;
    expectedStatus?: number;
    deserializeType?: any;
}

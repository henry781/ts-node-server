import {inject} from 'inversify';
import {Logger} from 'pino';
import * as _request from 'request';
import {CoreOptions} from 'request';
import {WebApplicationError} from '../error/WebApplicationError';
import {JsonConverter} from '../json/JsonConverter';
import {types} from '../types';
import {RequestOptions} from './RequestOptions';

const request = _request;

export abstract class GenericClient {

    protected logger: Logger;

    /**
     * Constructor
     * @param logger
     */
    constructor(@inject(types.Logger)logger: Logger) {
        this.logger = logger.child({module: 'GenericClient'});
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
     * Http request
     * @param uri
     * @param options
     * @param method
     */
    protected http<T>(uri: string, options: RequestOptions<T>, method: string): Promise<T> {

        const logger = this.logger.child({method: 'http'});

        logger.debug(`requesting <${uri}>`);

        const httpOptions: CoreOptions = {
            headers: {},
            json: true,
            method,
        };

        if (options.httpOptions) {
            logger.debug('override httpOptions');
            Object.assign(httpOptions, options.httpOptions);
            logger.debug('got httpOptions', httpOptions);
        }

        if (options.token) {
            logger.debug('setting authorization header');
            httpOptions.headers.Authorization = options.token;
        } else if (options.principal && options.principal.token) {
            logger.debug('setting authorization header');
            httpOptions.headers.Authorization = 'Bearer ' + options.principal.token.token;
        }

        if (options.body) {
            logger.debug('setting body');

            if (options.serializer === false) {
                httpOptions.body = options.body;

            } else if (typeof (options.serializer) === 'function') {
                logger.debug('serializing body');
                httpOptions.body = options.serializer(options.body);

            } else {
                httpOptions.body = JsonConverter.safeSerialize(options.body);
            }
        }

        return new Promise((resolve, reject) => {
            request(uri, httpOptions, (err, response, body) => {

                if (err) {
                    logger.error(`error calling <${uri}> :`, err);
                    const error = new WebApplicationError(`error calling <${uri}>`, 500, err);
                    reject(error);

                } else {

                    logger.debug(`request on <${uri}> complete`);
                    if (response.statusCode !== options.expectedStatus) {
                        const msg = `expecting status <${options.expectedStatus}> calling <${uri}>, got <${response.statusCode}>`;
                        logger.error(msg);
                        const error = new WebApplicationError(msg, 500);
                        reject(error);

                    } else {

                        if (options.deserializer === false) {
                            resolve(body);

                        } else if (typeof (options.deserializer) === 'function') {
                            resolve(options.deserializer(body));

                        } else if (options.deserializeType) {
                            resolve(JsonConverter.deserialize(body, options.deserializeType));

                        } else {
                            resolve();
                        }
                    }
                }
            });
        });
    }
}

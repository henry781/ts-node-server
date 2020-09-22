import * as chai from 'chai';
import {CoreOptions} from 'request';
import * as sinon from 'sinon';
import {jsonObject, jsonProperty} from 'tipify';
import {Principal} from '../auth/Principal';
import * as loggerService from '../logger/loggerService';
import {GenericClient, RequestOptions} from './GenericClient';
import {GenericClientError} from './GenericClientError';

describe('GenericClient', () => {

    const sandbox = sinon.createSandbox();

    class FinalClient extends GenericClient {
        public request = super.request;
        public get = super.get;
        public post = super.post;
        public delete = super.delete;
        public put = super.put;
        public patch = super.patch;
        public http = super.http;
        public buildHttpOptions = super.buildHttpOptions;
    }

    let genericClient: FinalClient;

    beforeEach(() => {
        genericClient = new FinalClient();
        sandbox.restore();
    });

    /**
     * get, post, delete, patch, put
     */
    describe('get, post, delete, patch, put should call http with suitable method', () => {

        for (const method of ['get', 'post', 'patch', 'delete', 'put']) {
            it('should call http with method ' + method, async () => {

                const expectedResult = {a: 'b'};

                const http = sinon.stub(genericClient, 'http')
                    .withArgs('api.com', {deserializer: false}, method)
                    .resolves(expectedResult);

                const actualResult = await genericClient[method]('api.com', {deserializer: false});
                chai.expect(actualResult).equal(expectedResult);
                chai.expect(http.calledOnce).to.be.true;
            });
        }
    });

    /**
     * Build HttpOptions
     */
    describe('buildHttpOptions', () => {

        it('should define method', () => {

            const httpOptions = genericClient.buildHttpOptions({}, 'get');
            chai.expect(httpOptions.method).equal('get');
        });

        it('should define request-id header when reqId is defined', () => {

            sandbox.stub(loggerService, 'getReqId').returns('1234567890');

            const httpOptions = genericClient.buildHttpOptions({}, 'get');
            chai.expect(httpOptions.headers).not.undefined;
            chai.expect(httpOptions.headers['request-id']).equal('1234567890');
        });

        it('should define httpOptions when httpOptions is defined', () => {

            const options: RequestOptions<void> = {
                httpOptions: {
                    headers: {
                        Demo: 'A',
                    },
                },
            };

            const httpOptions = genericClient.buildHttpOptions(options, 'get');
            chai.expect(httpOptions.headers).not.undefined;
            chai.expect(httpOptions.headers.Demo).equal('A');
        });

        it('should define Authorization from token when token is defined', () => {

            const options: RequestOptions<void> = {
                token: 'Bearer 12890',
            };

            const httpOptions = genericClient.buildHttpOptions(options, 'get');
            chai.expect(httpOptions.headers).not.undefined;
            chai.expect(httpOptions.headers.Authorization).equal('Bearer 12890');
        });

        it('should define Authorization from principal when principal is defined', () => {

            const options: RequestOptions<void> = {
                principal: new Principal({token: {scheme: 'Basic', token: '12347890', params: {}}}),
            };

            const httpOptions = genericClient.buildHttpOptions(options, 'get');
            chai.expect(httpOptions.headers).not.undefined;
            chai.expect(httpOptions.headers.Authorization).equal('Basic 12347890');
        });

        it('should define body as is when serializer is disabled', () => {

            const options: RequestOptions<void> = {
                body: '123456890',
                serializer: false,
            };

            const httpOptions = genericClient.buildHttpOptions(options, 'get');
            chai.expect(httpOptions.body).equal('123456890');
        });

        it('should define body as serialized body when serializer is defined', () => {

            const options: RequestOptions<void> = {
                body: '123456890',
                serializer: (body) => body === '123456890' ? '098765421' : undefined,
            };

            const httpOptions = genericClient.buildHttpOptions(options, 'get');
            chai.expect(httpOptions.body).equal('098765421');
        });

        it('should serialize body', () => {

            @jsonObject()
            class Person {

                @jsonProperty('name')
                public _name: string;

                constructor(name?: string) {
                    this._name = name;
                }
            }

            const options: RequestOptions<void> = {
                body: new Person('bill'),
            };

            const httpOptions = genericClient.buildHttpOptions(options, 'get');
            chai.expect(httpOptions.body).deep.equal({name: 'bill'});
        });
    });

    /**
     * http
     */
    describe('http', () => {

        it('should throw a GenericClientError when request failed', async () => {

            const requestOptions: RequestOptions<void> = {};
            const httpOptions: CoreOptions = {};

            sandbox.stub(genericClient, 'buildHttpOptions')
                .withArgs(requestOptions, 'get')
                .returns(httpOptions);

            // @ts-ignore
            genericClient.request = (url, options, callback: (err, response, body) => void) => {
                chai.expect(url).equal('api.com');
                chai.expect(options).equal(httpOptions);
                callback(new Error('client error'), undefined, undefined);
            };

            try {
                await genericClient.http('api.com', requestOptions, 'get');
                chai.expect.fail();
            } catch (err) {
                chai.expect(err).instanceOf(GenericClientError);
                chai.expect(err.cause.message).equal('client error');
            }
        });

        it('should throw a GenericClientError when actual status is not an expected one', async () => {

            const requestOptions: RequestOptions<void> = {
                expectedStatus: 201,
            };
            const httpOptions: CoreOptions = {};

            sandbox.stub(genericClient, 'buildHttpOptions')
                .withArgs(requestOptions, 'get')
                .returns(httpOptions);

            // @ts-ignore
            genericClient.request = (url, options, callback: (err, response, body) => void) => {
                chai.expect(url).equal('api.com');
                chai.expect(options).equal(httpOptions);
                callback(undefined, {statusCode: 200}, {});
            };

            try {
                await genericClient.http('api.com', requestOptions, 'get');
                chai.expect.fail();
            } catch (err) {
                chai.expect(err).instanceOf(GenericClientError);
                chai.expect(err.message).contains('expecting status <201>');
            }
        });

        it('should return body as is when deserializer is disabled', async () => {

            const requestOptions: RequestOptions<void> = {
                deserializer: false,
                expectedStatus: 200,
            };
            const httpOptions: CoreOptions = {};

            sandbox.stub(genericClient, 'buildHttpOptions')
                .withArgs(requestOptions, 'get')
                .returns(httpOptions);

            // @ts-ignore
            genericClient.request = (url, options, callback: (err, response, body) => void) => {
                chai.expect(url).equal('api.com');
                chai.expect(options).equal(httpOptions);
                callback(undefined, {statusCode: 200}, 'result');
            };

            const result = await genericClient.http('api.com', requestOptions, 'get');
            chai.expect(result).equal('result');
        });

        it('should return deserialized body when custom deserializer type is defined', async () => {

            const requestOptions: RequestOptions<void> = {
                deserializer: (body) => body === 'result' ? 'deserialized' : undefined,
                expectedStatus: 200,
            };
            const httpOptions: CoreOptions = {};

            sandbox.stub(genericClient, 'buildHttpOptions')
                .withArgs(requestOptions, 'get')
                .returns(httpOptions);

            // @ts-ignore
            genericClient.request = (url, options, callback: (err, response, body) => void) => {
                chai.expect(url).equal('api.com');
                chai.expect(options).equal(httpOptions);
                callback(undefined, {statusCode: 200}, 'result');
            };

            const result = await genericClient.http('api.com', requestOptions, 'get');
            chai.expect(result).equal('deserialized');
        });

        it('should return deserialized body', async () => {

            @jsonObject()
            class Person {

                @jsonProperty('name')
                public _name: string;

                constructor(name?: string) {
                    this._name = name;
                }
            }

            const requestOptions: RequestOptions<void> = {
                deserializeType: Person,
                expectedStatus: 200,
            };
            const httpOptions: CoreOptions = {};

            sandbox.stub(genericClient, 'buildHttpOptions')
                .withArgs(requestOptions, 'get')
                .returns(httpOptions);

            // @ts-ignore
            genericClient.request = (url, options, callback: (err, response, body) => void) => {
                chai.expect(url).equal('api.com');
                chai.expect(options).equal(httpOptions);
                callback(undefined, {statusCode: 200}, {name: 'bill'});
            };

            const result = await genericClient.http<Person>('api.com', requestOptions, 'get');
            chai.expect(result).not.undefined;
            chai.expect(result._name).equal('bill');
        });
    });
});

import * as chai from 'chai';
import {Container, injectable} from 'inversify';
import {types} from '../../types';
import {CommonUtil, WireupEndpoint} from './CommonUtil';
import {controller} from './controller/controller.decorator';
import {ControllerOptions} from './controller/ControllerOptions';
import {httpGet, httpPost} from './method/http.decorator';
import {MethodOptions} from './method/MethodOptions';
import {body, pathParam, queryParam} from './param/param.decorator';

describe('CommonUtil', () => {

    /**
     * Build url
     */
    describe('buildUrl', () => {

        it('should return ""', () => {

            const controllerOptions: ControllerOptions = {
                url: undefined,
            };
            const methodOptions: MethodOptions = {
                method: 'GET',
                url: undefined,
            };

            const url = CommonUtil.buildUrl(controllerOptions, methodOptions);
            chai.expect(url).equal('');
        });

        it('should return "/a/b" (case multiple /)', () => {

            const controllerOptions: ControllerOptions = {
                url: '/a/',
            };
            const methodOptions: MethodOptions = {
                method: 'GET',
                url: '/b',
            };

            const url = CommonUtil.buildUrl(controllerOptions, methodOptions);
            chai.expect(url).equal('/a/b');
        });

        it('should return "/b"', () => {

            const controllerOptions: ControllerOptions = {
                url: undefined,
            };
            const methodOptions: MethodOptions = {
                method: 'GET',
                url: '/b',
            };

            const url = CommonUtil.buildUrl(controllerOptions, methodOptions);
            chai.expect(url).equal('/b');

        });

        it('should return "/a"', () => {

            const controllerOptions: ControllerOptions = {
                url: '/a',
            };
            const methodOptions: MethodOptions = {
                method: 'GET',
                url: undefined,
            };

            const url = CommonUtil.buildUrl(controllerOptions, methodOptions);
            chai.expect(url).equal('/a');
        });
    });

    /**
     * Get all endpoints
     */
    describe('getAllEndpoints', () => {

        @injectable()
        @controller('/a')
        class ControllerA {

            @httpGet()
            public list() {
            }

            @httpGet(':name')
            public get(@pathParam('name') name: string) {
            }

            @httpPost()
            public create(@body()payload: string, @queryParam('clone') itemToClone: string) {
            }
        }

        const container = new Container();
        container.bind(types.Controller).to(ControllerA);
        const controllerA = container.getAll(types.Controller)[0] as ControllerA;

        it('should return endpoints', () => {

            const endpoints = CommonUtil.getAllEndpoints(container);

            const expectedListEndpoint: WireupEndpoint = {
                controller: controllerA,
                controllerOptions: {
                    url: '/a',
                },
                method: 'list',
                methodOptions: {
                    method: 'GET',
                },
                paramsOptions: [],
                url: '/a',
            };

            const expectedGetEndpoint: WireupEndpoint = {
                controller: controllerA,
                controllerOptions: {
                    url: '/a',
                },
                method: 'get',
                methodOptions: {
                    method: 'GET',
                    url: ':name',
                },
                paramsOptions: [{
                    description: undefined,
                    name: 'name',
                    paramType: String,
                    type: 'path',
                }],
                url: '/a/:name',
            };

            const expectedCreateEndpoint: WireupEndpoint = {
                controller: controllerA,
                controllerOptions: {
                    url: '/a',
                },
                method: 'create',
                url: '/a',

                methodOptions: {
                    method: 'POST',
                },
                paramsOptions: [
                    {
                        paramType: String,
                        type: 'body',
                    },
                    {
                        description: undefined,
                        name: 'clone',
                        paramType: String,
                        type: 'query',
                    },
                ],
            };

            chai.expect(endpoints).length(3);
            chai.expect(endpoints).to.deep.include(expectedListEndpoint);
            chai.expect(endpoints).to.deep.include(expectedGetEndpoint);
            chai.expect(endpoints).to.deep.include(expectedCreateEndpoint);
        });
    });
});

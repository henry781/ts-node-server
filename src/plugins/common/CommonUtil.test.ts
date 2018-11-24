import * as chai from 'chai';
import {Container, injectable} from 'inversify';
import {Types} from '../../Types';
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
                url: undefined,
                method: 'GET',
            };

            const url = CommonUtil.buildUrl(controllerOptions, methodOptions);
            chai.expect(url).equal('');
        });

        it('should return "/a/b" (case multiple /)', () => {

            const controllerOptions: ControllerOptions = {
                url: '/a/',
            };
            const methodOptions: MethodOptions = {
                url: '/b',
                method: 'GET',
            };

            const url = CommonUtil.buildUrl(controllerOptions, methodOptions);
            chai.expect(url).equal('/a/b');
        });

        it('should return "/b"', () => {

            const controllerOptions: ControllerOptions = {
                url: undefined,
            };
            const methodOptions: MethodOptions = {
                url: '/b',
                method: 'GET',
            };

            const url = CommonUtil.buildUrl(controllerOptions, methodOptions);
            chai.expect(url).equal('/b');

        });

        it('should return "/a"', () => {

            const controllerOptions: ControllerOptions = {
                url: '/a',
            };
            const methodOptions: MethodOptions = {
                url: undefined,
                method: 'GET',
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
        container.bind(Types.Controller).to(ControllerA);
        const controllerA = container.getAll(Types.Controller)[0] as ControllerA;

        it('should return endpoints', () => {

            const endpoints = CommonUtil.getAllEndpoints(container);

            const expectedListEndpoint: WireupEndpoint = {
                method: 'list',
                url: '/a',
                controller: controllerA,
                paramsOptions: [],
                methodOptions: {
                    method: 'GET',
                },
                controllerOptions: {
                    url: '/a',
                },
            };

            const expectedGetEndpoint: WireupEndpoint = {
                method: 'get',
                url: '/a/:name',
                controller: controllerA,
                paramsOptions: [{
                    type: 'path',
                    name: 'name',
                    paramType: String,
                    description: undefined,
                }],
                methodOptions: {
                    method: 'GET',
                    url: ':name',
                },
                controllerOptions: {
                    url: '/a',
                },
            };

            const expectedCreateEndpoint: WireupEndpoint = {
                method: 'create',
                url: '/a',
                controller: controllerA,
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
                methodOptions: {
                    method: 'POST',
                },
                controllerOptions: {
                    url: '/a',
                },
            };

            chai.expect(endpoints).length(3);
            chai.expect(endpoints).to.deep.include(expectedListEndpoint);
            chai.expect(endpoints).to.deep.include(expectedGetEndpoint);
            chai.expect(endpoints).to.deep.include(expectedCreateEndpoint);
        });
    });
});

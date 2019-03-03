import {QuerySearch} from '@henry781/querysearch';
import * as chai from 'chai';
import {HttpRequest, Reply} from '../../../types';
import {body, httpReply, httpRequest, pathParam, queryParam, querySearch, ROUTE_PARAMS} from './param.decorator';
import {ParamOptions} from './ParamOptions';

describe('param', () => {

    class ControllerA {

        public post(@body(String) bodyContent: string,
                    @pathParam('name') name: string,
                    @queryParam('limit') limit: number,
                    @httpRequest() request: HttpRequest,
                    @httpReply() reply: Reply,
                    @querySearch() search: QuerySearch) {
        }
    }

    const controllerA = new ControllerA();

    /**
     * Body decorator
     */
    describe('body', () => {

        it('should define metadata', () => {
            const paramOptions = Reflect.getMetadata(ROUTE_PARAMS, controllerA, 'post')[0] as ParamOptions;
            chai.expect(paramOptions).not.undefined;
            chai.expect(paramOptions.type).equal('body');
            chai.expect(paramOptions.paramType).equal(String);
        });
    });

    /**
     * PathParam decorator
     */
    describe('pathParam', () => {

        it('should define metadata', () => {
            const paramOptions = Reflect.getMetadata(ROUTE_PARAMS, controllerA, 'post')[1] as ParamOptions;
            chai.expect(paramOptions).not.undefined;
            chai.expect(paramOptions.name).equal('name');
            chai.expect(paramOptions.type).equal('path');
            chai.expect(paramOptions.paramType).equal(String);
        });
    });

    /**
     * QueryParam decorator
     */
    describe('queryParam', () => {

        it('should define metadata', () => {
            const paramOptions = Reflect.getMetadata(ROUTE_PARAMS, controllerA, 'post')[2] as ParamOptions;
            chai.expect(paramOptions).not.undefined;
            chai.expect(paramOptions.name).equal('limit');
            chai.expect(paramOptions.type).equal('query');
            chai.expect(paramOptions.paramType).equal(Number);
        });
    });

    /**
     * QuerySearch decorator
     */
    describe('querySearch', () => {

        it('should define metadata', () => {
            const paramOptions = Reflect.getMetadata(ROUTE_PARAMS, controllerA, 'post')[5] as ParamOptions;
            chai.expect(paramOptions).not.undefined;
            chai.expect(paramOptions.type).equal('search');
            chai.expect(paramOptions.paramType).equal(QuerySearch);
        });
    });

    /**
     * HttpRequest decorator
     */
    describe('httpRequest', () => {

        it('should define metadata', () => {
            const paramOptions = Reflect.getMetadata(ROUTE_PARAMS, controllerA, 'post')[3] as ParamOptions;
            chai.expect(paramOptions).not.undefined;
            chai.expect(paramOptions.type).equal('httpRequest');
        });
    });

    /**
     * HttpReply decorator
     */
    describe('httpReply', () => {

        it('should define metadata', () => {
            const paramOptions = Reflect.getMetadata(ROUTE_PARAMS, controllerA, 'post')[4] as ParamOptions;
            chai.expect(paramOptions).not.undefined;
            chai.expect(paramOptions.type).equal('httpReply');
        });
    });
});

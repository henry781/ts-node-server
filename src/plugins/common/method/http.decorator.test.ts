import * as chai from 'chai';
import {http, httpDelete, httpGet, httpPatch, httpPost, httpPut, ROUTE_METHOD} from './http.decorator';
import {MethodOptions} from './MethodOptions';

describe('http', () => {

    class ControllerA {

        @http({url: '/b', method: 'GET'})
        get() {
        }

        @httpGet({url: '/c'})
        getC() {
        }

        @httpGet('/d')
        getD() {
        }

        @httpGet()
        getE() {
        }

        @httpPut({url: '/c'})
        putC() {
        }

        @httpPut('/d')
        putD() {
        }

        @httpPut()
        putE() {
        }

        @httpPatch({url: '/c'})
        patchC() {
        }

        @httpPatch('/d')
        patchD() {
        }

        @httpPatch()
        patchE() {
        }

        @httpPost({url: '/c'})
        postC() {
        }

        @httpPost('/d')
        postD() {
        }

        @httpPost()
        postE() {
        }

        @httpDelete({url: '/c'})
        deleteC() {
        }

        @httpDelete('/d')
        deleteD() {
        }

        @httpDelete()
        deleteE() {
        }
    }

    const controllerA = new ControllerA();

    /**
     * Http decorator
     */
    describe('http', () => {

        it('should define metadata', () => {

            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'get') as MethodOptions;

            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/b');
            chai.expect(methodOptions.method).equal('GET');
        });
    });

    /**
     * HttpGet decorator
     */
    describe('httpGet', () => {

        it('should define metadata', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'getC') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/c');
            chai.expect(methodOptions.method).equal('GET');
        });

        it('should define metadata (arg is a string)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'getD') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/d');
            chai.expect(methodOptions.method).equal('GET');
        });

        it('should define metadata (no arg)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'getE') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal(undefined);
            chai.expect(methodOptions.method).equal('GET');
        });
    });

    /**
     * HttpPut decorator
     */
    describe('httpPut', () => {

        it('should define metadata', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'putC') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/c');
            chai.expect(methodOptions.method).equal('PUT');
        });

        it('should define metadata (arg is a string)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'putD') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/d');
            chai.expect(methodOptions.method).equal('PUT');
        });

        it('should define metadata (no arg)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'putE') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal(undefined);
            chai.expect(methodOptions.method).equal('PUT');
        });
    });

    /**
     * HttpPost decorator
     */
    describe('httpPost', () => {

        it('should define metadata', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'postC') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/c');
            chai.expect(methodOptions.method).equal('POST');
        });

        it('should define metadata (arg is a string)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'postD') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/d');
            chai.expect(methodOptions.method).equal('POST');
        });

        it('should define metadata (no arg)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'postE') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal(undefined);
            chai.expect(methodOptions.method).equal('POST');
        });
    });

    /**
     * HttpPatch decorator
     */
    describe('httpPatch', () => {

        it('should define metadata', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'patchC') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/c');
            chai.expect(methodOptions.method).equal('PATCH');
        });

        it('should define metadata (arg is a string)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'patchD') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/d');
            chai.expect(methodOptions.method).equal('PATCH');
        });

        it('should define metadata (no arg)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'patchE') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal(undefined);
            chai.expect(methodOptions.method).equal('PATCH');
        });
    });

    /**
     * HttpDelete decorator
     */
    describe('httpDelete', () => {

        it('should define metadata', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'deleteC') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/c');
            chai.expect(methodOptions.method).equal('DELETE');
        });

        it('should define metadata (arg is a string)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'deleteD') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal('/d');
            chai.expect(methodOptions.method).equal('DELETE');
        });

        it('should define metadata (no arg)', () => {
            const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controllerA, 'deleteE') as MethodOptions;
            chai.expect(methodOptions).not.undefined;
            chai.expect(methodOptions.url).equal(undefined);
            chai.expect(methodOptions.method).equal('DELETE');
        });
    });
});


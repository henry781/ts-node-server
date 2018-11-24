import {Wireup} from './Wireup';
import * as sinon from 'sinon';
import {SinonSandbox} from 'sinon';
import {Container} from 'inversify';
import {FastifyInstance, RouteOptions} from 'fastify';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import * as pino from 'pino';
import * as chai from 'chai';

describe('Wireup', () => {

    let sandbox: SinonSandbox;

    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    /**
     * Get handler
     */
    describe('getHandler', () => {

        // TODO : implement tests

    });

    /**
     * Get plugin
     */
    describe('getPlugin', () => {

        let instance = <FastifyInstance>{
            route: (opts: RouteOptions<any, any, any>) => {
            },
            log: pino()
        };

        const container = new Container();
        const endpoint: WireupEndpoint = {
            url: '/a',
            controller: {},
            controllerOptions: {},
            method: 'get',
            methodOptions: {
                method: 'GET'
            },
            paramsOptions: []
        };

        it('should do register routes', () => {

            const route = sinon.stub(instance, 'route');
            const handler = async () => {
            };

            sandbox.stub(CommonUtil, 'getAllEndpoints').withArgs(container).returns([endpoint]);
            sandbox.stub(Wireup, 'getHandler').withArgs(endpoint).returns(handler);

            const next = () => {
            };

            Wireup.getPlugin(instance, {container: container}, next);

            chai.expect(route.calledOnce).to.be.true;
            chai.expect(route.calledWith({
                method: 'GET',
                url: '/a',
                handler
            })).to.be.true;
        });

        it('should call next', () => {

            sandbox.stub(CommonUtil, 'getAllEndpoints').withArgs(container).returns([]);

            const next = () => {
            };
            const nextSpy = sandbox.spy(next);

            Wireup.getPlugin(instance, {container: container}, next);

            chai.expect(nextSpy.calledOnce);
        });
    });
});

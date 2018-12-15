import * as chai from 'chai';
import {FastifyInstance, RouteOptions} from 'fastify';
import {Container} from 'inversify';
import * as pino from 'pino';
import * as sinon from 'sinon';
import {SinonSandbox} from 'sinon';
import {CommonUtil, WireupEndpoint} from '../common/CommonUtil';
import {Wireup} from './Wireup';

describe('Wireup', () => {

    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
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

        const instance = {
            log: pino(),
            route: (opts: RouteOptions<any, any, any>) => {
            },
        } as FastifyInstance;

        const container = new Container();
        const endpoint: WireupEndpoint = {
            controller: {},
            controllerOptions: {},
            method: 'get',
            methodOptions: {
                method: 'GET',
            },
            paramsOptions: [],
            url: '/a',
        };

        it('should do register routes', () => {

            const route = sinon.stub(instance, 'route');
            const getAuthorizationHandler = async () => {
            };

            const getSerializerHandler = async () => {
            };

            const handler = async () => {
            };

            sandbox.stub(CommonUtil, 'getAllEndpoints').withArgs(container).returns([endpoint]);
            sandbox.stub(Wireup, 'getAuthorizationHandler').withArgs(container, endpoint).returns(getAuthorizationHandler);
            sandbox.stub(Wireup, 'getSerializerHandler').withArgs().returns(getSerializerHandler);
            sandbox.stub(Wireup, 'getHandler').withArgs(endpoint).returns(handler);

            const next = () => {
            };

            Wireup.getPlugin(instance, {container}, next);

            chai.expect(route.calledOnce).to.be.true;
            chai.expect(route.calledWith({
                beforeHandler: [getAuthorizationHandler, getSerializerHandler],
                handler,
                method: 'GET',
                url: '/a',
            })).to.be.true;
        });

        it('should call next', () => {

            sandbox.stub(CommonUtil, 'getAllEndpoints').withArgs(container).returns([]);

            const next = () => {
            };
            const nextSpy = sandbox.spy(next);

            Wireup.getPlugin(instance, {container}, next);

            chai.expect(nextSpy.calledOnce);
        });
    });
});

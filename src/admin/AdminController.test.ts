import * as chai from 'chai';
import inspector from 'inspector';
import {Container} from 'inversify';
import pino from 'pino';
import * as sinon from 'sinon';
import {ControllerTest} from '../test/ControllerTest';
import {types} from '../types';
import {AdminController, AdminOptions} from './AdminController';
import chaiHttp from 'chai-http';
import { request, expect } from 'chai';
import Logger = pino.Logger;

chai.use(chaiHttp);

describe('AdminController', () => {

    const sandbox = sinon.createSandbox();
    const container = new Container();

    const options: AdminOptions = {auth: undefined};
    const adminController = new AdminController(options);
    container.bind(types.Controller).toConstantValue(adminController);

    const test = new ControllerTest(container);

    afterEach(() => {
        sandbox.restore();
    });

    /**
     * Set logging level
     */
    describe('setLoggingLevel', () => {

        it('should throw an error when level is unknown', async () => {
            const response = await request(test.server)
                .put('/admin/logging/level/TEST')
                .send();
            expect(response.status).equal(400);
        });

        it('should set level', async () => {

            const logger = test.instance.log as Logger;
            logger.level = 'debug';
            expect(logger.level).equal('debug');

            const response = await request(test.server)
                .put('/admin/logging/level/trace')
                .send();

            expect(logger.level).equal('trace');

            expect(response.status).equal(204);
        });
    });

    /**
     * Enable inspector
     */
    describe('enableInspector', () => {

        it('should open inspector', async () => {

            const open = sandbox.stub(inspector, 'open')
                .withArgs()
                .returns(undefined);

            const url = sandbox.stub(inspector, 'url')
                .withArgs()
                .returns('http//inspector');

            const response = await request(test.server)
                .put('/admin/inspector/enabled')
                .send();

            expect(response.status).equal(200);
            expect(response.body.url).equal('http//inspector');
            expect(open.calledOnce).to.be.true;
            expect(url.calledOnce).to.be.true;
        });
    });

    /**
     * Disable inspector
     */
    describe('disableInspector', () => {

        it('should close inspector', async () => {

            const close = sandbox.stub(inspector, 'close')
                .withArgs()
                .returns(undefined);

            const response = await request(test.server)
                .put('/admin/inspector/disabled')
                .send();

            expect(response.status).equal(204);
            expect(close.calledOnce).to.be.true;
        });
    });
});

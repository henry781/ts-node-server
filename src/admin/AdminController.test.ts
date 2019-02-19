import * as chai from 'chai';
import * as inspector from 'inspector';
import {Container} from 'inversify';
import * as sinon from 'sinon';
import {loggerService} from '../core/loggerService';
import {ControllerTest} from '../test/ControllerTest';
import {types} from '../types';
import {AdminController} from './AdminController';

const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('AdminController', () => {

    const sandbox = sinon.createSandbox();
    const container = new Container();

    const adminController = new AdminController();
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
            const response = await chai.request(test.server)
                .put('/admin/logging/level/TEST')
                .send();
            chai.expect(response.status).equal(400);
        });

        it('should set level', async () => {

            loggerService.level = 'debug';
            chai.expect(loggerService.level).equal('debug');

            const response = await chai.request(test.server)
                .put('/admin/logging/level/trace')
                .send();

            chai.expect(loggerService.level).equal('trace');

            chai.expect(response.status).equal(204);
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

            const response = await chai.request(test.server)
                .put('/admin/inspector/enabled')
                .send();

            chai.expect(response.status).equal(200);
            chai.expect(response.body.url).equal('http//inspector');
            chai.expect(open.calledOnce).to.be.true;
            chai.expect(url.calledOnce).to.be.true;
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

            const response = await chai.request(test.server)
                .put('/admin/inspector/disabled')
                .send();

            chai.expect(response.status).equal(204);
            chai.expect(close.calledOnce).to.be.true;
        });
    });
});

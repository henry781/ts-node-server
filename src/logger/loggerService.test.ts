import * as chai from 'chai';
import {createNamespace} from 'cls-hooked';
import pino from 'pino';
import * as sinon from 'sinon';
import {getLogger, loggerService} from './loggerService';

describe('getLogger', () => {

    const sandbox = sinon.createSandbox();
    loggerService.log = pino();

    beforeEach(() => {
        sandbox.restore();
    });

    describe('when no parameter is provided', () => {

        it('should return loggerService', () => {
            const logger = getLogger();
            chai.expect(logger).equal(loggerService.log);
        });

        it('should return request logger', () => {

            const requestLogger = loggerService.log.child({reqId: '1'});
            const session = createNamespace('app');

            session.run(() => {
                session.set('log', requestLogger);
                const logger = getLogger();
                chai.expect(logger).equal(requestLogger);
            });
        });
    });

    describe('when one string parameter is provided', () => {
        it('should return logger', () => {
            const spy = sandbox.spy(loggerService.log, 'child');
            const logger = getLogger('method');
            chai.expect(logger).equal(spy.returnValues[0]);
            chai.expect(spy.args[0][0]).deep.equal({method: 'method'});
        });
    });

    describe('when an array of strings is provided', () => {
        it('should return logger', () => {
            const spy = sandbox.spy(loggerService.log, 'child');
            const logger = getLogger(['method', 'subModule1']);
            chai.expect(logger).equal(spy.returnValues[0]);
            chai.expect(spy.args[0][0]).deep.equal({method: 'method.subModule1'});
        });
    });

    describe('when a string and a class is provided', () => {

        class Service {
        }

        const service = new Service();

        it('should return logger', () => {
            const spy = sandbox.spy(loggerService.log, 'child');
            const logger = getLogger('method', service);
            chai.expect(logger).equal(spy.returnValues[0]);
            chai.expect(spy.args[0][0]).deep.equal({method: 'method', module: 'Service'});
        });
    });
});

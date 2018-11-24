import * as chai from 'chai';
import {controller, ROUTE_CONTROLLER} from './controller.decorator';
import {ControllerOptions} from './ControllerOptions';

/**
 * Controller decorator
 */
describe('controller', () => {

    it('should define metadata', () => {

        @controller({url: '/a'})
        class ControllerA {
        }

        const controllerA = new ControllerA();

        const controllerOptions = Reflect.getMetadata(ROUTE_CONTROLLER, controllerA) as ControllerOptions;

        chai.expect(controllerOptions).not.undefined;
        chai.expect(controllerOptions.url).equal('/a');
    });

    it('should define metadata (arg is an url)', () => {

        @controller('/a')
        class ControllerA {
        }

        const controllerA = new ControllerA();

        const controllerOptions = Reflect.getMetadata(ROUTE_CONTROLLER, controllerA) as ControllerOptions;

        chai.expect(controllerOptions).not.undefined;
        chai.expect(controllerOptions.url).equal('/a');
    });

    it('should define metadata (no arg)', () => {

        @controller()
        class ControllerA {
        }

        const controllerA = new ControllerA();

        const controllerOptions = Reflect.getMetadata(ROUTE_CONTROLLER, controllerA) as ControllerOptions;

        chai.expect(controllerOptions).not.undefined;
        chai.expect(controllerOptions.url).undefined;
    });
});

import {injectable, multiInject} from 'inversify';
import {controller} from '../core/controller/controller.decorator';
import {httpGet} from '../core/method/http.decorator';
import {Types} from '../Types';
import {Healthcheck} from './Healthcheck';

@injectable()
@controller('/healtcheck')
export class HealthcheckController {

    constructor(@multiInject(Types.Healthcheck) private  healthchecks: Healthcheck[]) {
    }

    @httpGet()
    public check() {

    }
}

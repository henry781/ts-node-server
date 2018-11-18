import {injectable, multiInject} from 'inversify';
import {controller} from '../../core/controller/controller.decorator';
import {httpGet} from '../../core/method/http.decorator';
import {Healthcheck} from './Healthcheck';
import {Types} from '../../Types';

@injectable()
@controller('/healtcheck')
export class HealthcheckController {

    constructor(@multiInject(Types.Healthcheck) private  healthchecks: Healthcheck[]) {
    }

    @httpGet()
    public check() {

    }
}

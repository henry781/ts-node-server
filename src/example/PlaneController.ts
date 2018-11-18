import 'reflect-metadata';
import {injectable} from 'inversify';
import {controller} from '../core/controller/controller.decorator';

@injectable()
@controller('/v1/planes')
export class PlaneController {

}
import {Container} from 'inversify';
import {UserController} from './UserController';
import {Controller} from '../core/controller/Controller';
import {Types} from '../Types';
import {PlaneController} from './PlaneController';
import {Server} from '../core/Server';

const container = new Container();
container.bind<Controller>(Types.Controller).to(UserController);
container.bind<Controller>(Types.Controller).to(PlaneController);

const server = new Server({
    container: container,
    metrics: true,
    swagger: true,
    healthchecks: false,
    mongo:{}
});

server.listen(2000);
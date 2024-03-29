import {Container} from 'inversify';
import {Server} from '../core/Server';

export class ControllerTest {

    private _server: Server;

    public get server() {
        return this._server.instance.server;
    }

    public get instance() {
        return this._server.instance;
    }

    constructor(container: Container) {

        this._server = new Server({
            auth: {},
            container,
            healthcheck: false,
            mongo: false,
            swagger: false,
            ignoreProvidesDecorator: true
        });
    }
}

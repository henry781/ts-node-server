import {Server} from '../core/Server';
import {Container} from 'inversify';

const container = new Container();

const server = new Server({
    container,
    mongo: false,
    admin: true,
    auth:{
        jwt: {
            name: 'keycloak',
            jwksUri: 'http://localhost:8080/auth/realms/master/protocol/openid-connect/certs',
            authorizationUrl: 'http://localhost:8080/auth/realms/master/protocol/openid-connect/auth',
            application: 'ops'
        }
    }
});

server.listen(3000);
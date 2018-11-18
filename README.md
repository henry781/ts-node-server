# ts-node-server

_WORK IN PROGRESS_

## What is ts-node-server ?

ts-node-server is node framework for quickly developing powerful RESTful web services in Typescript.

It pulls together some of the best node libraries :

* [Fastify](https://github.com/fastify/fastify) : Fast and low overhead web framework, for Node.js

* [Pino](https://github.com/pinojs/pino) : Super fast, all natural JSON logger for Node.js

* [Inversify](https://github.com/inversify/InversifyJS) : A powerful and lightweight inversion of control container for JavaScript & Node.js apps powered by TypeScript.

* [Swagger UI](https://github.com/swagger-api/swagger-ui) : A collection of HTML, Javascript, and CSS assets that dynamically generate beautiful documentation from a Swagger-compliant API.

* [MongoDB driver](https://github.com/mongodb/node-mongodb-native) : Mongo DB Native NodeJS Driver

## Usage

### Server

```
const container = new Container();
container.bind<Controller>(Types.Controller).to(UserController);
container.bind<Controller>(Types.Controller).to(PlaneController);

const server = new Server({
    container: container,
    metrics: true,
    swagger: true,
    healthchecks: false,
    mongo: {}
});

server.listen(2000);
```

### Controllers

```
@injectable()
@controller('/v1/users')
export class UserController {

    /**
     * Get a user by id
     * @param {string} name
     * @param {Reply} reply
     * @returns {Promise<void>}
     */
    @httpGet({
        url: '/:name',
        swagger: {
            summary: 'Get a user by name',
            tags: ['user'],
            operationId: 'get',
            responses: {
                200: {
                    description: 'user returned successfully'
                },
                404: {
                    description: 'user cannot be found'
                }
            }
        }
    })
    public async get(@pathParam('name')name: string, @httpReply() reply: Reply) {

        const user = await this.callDb().then(() => {
            if (name === 'henry') {
                return 'OK';
            } else {
                return undefined;
            }
        });

        if (user) {
            reply.send(user);
        } else {
            reply.status(404).send();
        }
    }

    /**
     * Create a user
     * @param {boolean} clone
     * @returns {Promise<string>}
     */
    @httpPost({
        swagger: {
            summary: 'Create a user',
            tags: ['user'],
            operationId: 'create',
            responses: {
                201: {
                    description: 'everything is ok'
                }
            }
        }
    })
    public async create(@queryParam('clone')clone: boolean) {
        return 'OK';
    }
...
```
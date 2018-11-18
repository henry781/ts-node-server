import 'reflect-metadata';
import {injectable} from 'inversify';
import {httpGet, httpPost} from '../core/method/http.decorator';
import {httpReply, pathParam} from '../core/param/param.decorator';
import {Reply} from '../Types';
import {controller} from "../core/controller/controller.decorator";

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
    public async create(@pathParam('id')id: string) {
        return id;
    }

    /**
     * Method to simulate an interaction with db
     * @returns {Promise}
     */
    public async callDb() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 50)
        });
    };
}

import * as inspector from 'inspector';
import {decorate} from 'inversify';
import {Logger} from 'pino';
import {loggerService} from '../core/loggerService';
import {WebServiceError} from '../error/WebServiceError';
import {controller, httpPut, pathParam} from '../plugins/common/api';
import {AdminOptions} from './AdminOptions';

@controller('/admin')
export class AdminController {

    /**
     * Decorate methods
     * @param options
     */
    public static decorateMethods(options: AdminOptions) {

        const auth = options ? options.auth : undefined;

        decorate(
            httpPut({url: 'logging/level/:level', auth}),
            AdminController.prototype,
            'setLoggingLevel');

        decorate(
            httpPut({url: 'inspector/enabled', auth}),
            AdminController.prototype,
            'enableInspector');

        decorate(
            httpPut({url: 'inspector/disabled', auth}),
            AdminController.prototype,
            'disableInspector');
    }

    private logger: Logger;

    /**
     * Constructor
     */
    constructor(options?: AdminOptions) {
        this.logger = loggerService.child({module: 'AdminController'});
        AdminController.decorateMethods(options);
    }

    /**
     * Set logging level
     * @param level
     */
    public async setLoggingLevel(@pathParam('level') level: string) {

        const logger = this.logger.child({method: 'setLoggingLevel'});

        const value = loggerService.levels.labels[loggerService.levels.values[level]];

        if (value === undefined) {
            throw new WebServiceError(`level <${level}> is unknown`, 400);
        }
        logger.info(`logging level changed to <${value}>`);
        loggerService.level = value;
    }

    /**
     * Enable debug
     */
    public async enableInspector() {

        const logger = this.logger.child({method: 'enableInspector'});

        inspector.open();

        logger.info('inspector enabled');
        return {
            url: inspector.url(),
        };
    }

    /**
     * Disable debug
     */
    public async disableInspector() {

        const logger = this.logger.child({method: 'disableInspector'});

        inspector.close();
        logger.info('inspector disabled');
    }
}

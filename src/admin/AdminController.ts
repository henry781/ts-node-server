import * as inspector from 'inspector';
import {decorate} from 'inversify';
import pino from 'pino';
import {WebServiceError} from '../core/WebServiceError';
import {getLogger} from '../logger/loggerService';
import {AuthOptions, controller, httpPut, httpRequest, instanceLogger, pathParam, queryParam} from '../plugins/common/api';
import {Request} from '../types';
import Logger = pino.Logger;

@controller({url: '/admin', provides: false})
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

    /**
     * Constructor
     */
    constructor(private options: AdminOptions) {
        AdminController.decorateMethods(options);
    }

    /**
     * Set logging level
     * @param level
     * @param request
     * @param instanceLog
     */
    public async setLoggingLevel(@pathParam('level') level: string,
                                 @httpRequest() request: Request,
                                 @instanceLogger() instanceLog: Logger) {

        const logger = getLogger('setLoggingLevel', this);

        const value = instanceLog.levels.labels[instanceLog.levels.values[level]];

        if (value === undefined) {
            throw new WebServiceError(`level <${level}> is unknown`, 400);
        }
        logger.info(`logging level changed to <${value}>`);
        instanceLog.level = value;
    }

    /**
     * Enable debug
     */
    public async enableInspector(@queryParam('port') port: number) {

        const logger = getLogger('enableInspector', this);

        const inspectorPort = port ? port :
            this.options.inspectorPort ? this.options.inspectorPort : undefined;

        inspector.open(inspectorPort, this.options.inspectorHost);

        logger.info('inspector enabled');
        return {
            url: inspector.url(),
        };
    }

    /**
     * Disable debug
     */
    public async disableInspector() {

        const logger = getLogger('disableInspector', this);

        inspector.close();
        logger.info('inspector disabled');
    }
}

export interface AdminOptions {
    auth: string | string[] | { [provider: string]: AuthOptions };
    inspectorPort?: number;
    inspectorHost?: string;
}

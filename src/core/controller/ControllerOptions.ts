import {SwaggerMethodConf} from '../../plugins/swagger/SwaggerMethodConf';

/**
 * Controller options
 */
export interface ControllerOptions {
    url?: string;
    swagger?: SwaggerMethodConf;
}
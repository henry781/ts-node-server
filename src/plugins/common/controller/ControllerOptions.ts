import {OpenApiMethod} from '../../swagger-generator/models/OpenApiMethod';

/**
 * Controller options
 */
export interface ControllerOptions {
    url?: string;
    swagger?: OpenApiMethod;
    provides?: boolean;
}

import {SwaggerMethodParameterConf} from './SwaggerMethodParameterConf';
import {SwaggerMethodResponseConf} from './SwaggerMethodResponseConf';

export interface SwaggerMethodConf {

    tags?: string[];
    summary?: string;
    operationId?: string;
    consumes?: string[];
    produces?: string[];
    parameters?: SwaggerMethodParameterConf[];
    responses?: { [key: number]: SwaggerMethodResponseConf };
}

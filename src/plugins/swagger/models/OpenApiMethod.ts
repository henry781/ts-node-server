import {OpenApiMethodParameter} from './OpenApiMethodParameter';
import {OpenApiMethodResponse} from './OpenApiMethodResponse';

export interface OpenApiMethod {

    tags?: string[];
    summary?: string;
    operationId?: string;
    consumes?: string[];
    produces?: string[];
    parameters?: OpenApiMethodParameter[];
    responses?: { [key: number]: OpenApiMethodResponse };
}

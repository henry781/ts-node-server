import {OpenApiMethodParameter} from './OpenApiMethodParameter';
import {OpenApiMethodResponse} from './OpenApiMethodResponse';
import {OpenApiRequestBody} from './OpenApiRequestBody';

export interface OpenApiMethod {
    tags?: string[];
    summary?: string;
    operationId?: string;
    requestBody?: OpenApiRequestBody;
    consumes?: string[];
    produces?: string[];
    parameters?: OpenApiMethodParameter[];
    responses?: { [key: number]: OpenApiMethodResponse };
}

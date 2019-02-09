import {OpenApiSchema} from './OpenApiSchema';

export interface OpenApiMethodParameter {
    in?: 'path' | 'query' | 'body';
    name?: string;
    description?: string;
    required?: boolean;
    explode?: boolean;
    schema?: OpenApiSchema;
}

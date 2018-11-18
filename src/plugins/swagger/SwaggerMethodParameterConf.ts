export interface SwaggerMethodParameterConf {
    in?: 'path' | 'query' | 'path';
    name?: string;
    description?: string;
    required?: boolean;
    schema?: {
        type?: 'integer' | 'string',
    };
}

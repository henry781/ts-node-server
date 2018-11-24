export interface OpenApiMethodParameter {
    in?: 'path' | 'query' | 'body';
    name?: string;
    description?: string;
    required?: boolean;
    schema?: {
        type?: 'integer' | 'string',
    };
}

export interface OpenApiMethodParameter {
    in?: 'path' | 'query' | 'body';
    name?: string;
    description?: string;
    required?: boolean;
    explode?: boolean;
    schema?: {
        type?: 'integer' | 'string' | 'array',
        items?: { type?: string },
    };
}

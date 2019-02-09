export interface OpenApiSchema {

    type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';

    required?: string[];

    $ref?: string;

    properties?: {
        [name: string]: OpenApiSchema,
    };

    allOf?: Array<{ $ref: string } | OpenApiSchema>;

    items?: OpenApiSchema;
}

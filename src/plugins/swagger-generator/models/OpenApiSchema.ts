export interface OpenApiSchema {

    type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'enum';

    required?: string[];

    $ref?: string;

    properties?: {
        [name: string]: OpenApiSchema,
    };

    allOf?: Array<{ $ref: string } | OpenApiSchema>;

    items?: OpenApiSchema;

    enum?: string[];
}

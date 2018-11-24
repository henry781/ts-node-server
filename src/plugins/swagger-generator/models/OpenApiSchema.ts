export interface OpenApiSchema {

    type?: 'object' | 'array';

    required?: string[];

    properties?: {
        [name: string]: {
            type?: 'string' | 'number' | 'boolean';
            $ref?: string
        }
    }

    allOf?: ({ $ref: string } | OpenApiSchema)[];

    items?: {
        $ref: string;
    }
}

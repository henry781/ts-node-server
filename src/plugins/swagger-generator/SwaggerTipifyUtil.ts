import {
    ArrayConverter,
    ArrayConverterOptions,
    BooleanConverter,
    JsonConverterMapper,
    normalizeConverter,
    NumberConverter,
    ObjectConverter,
    ObjectConverterOptions,
    StringConverter,
    TypeOrConverter,
} from 'tipify';
import {OpenApiSchema} from './models/OpenApiSchema';

export class SwaggerTipifyUtil {

    public static buildOpenApiSchema(type: TypeOrConverter,
                                     schemas: { [name: string]: OpenApiSchema }): OpenApiSchema {

        const c = normalizeConverter(type);

        if (c.converter === StringConverter) {
            return {type: 'string'};

        } else if (c.converter === NumberConverter) {
            return {type: 'number'};

        } else if (c.converter === BooleanConverter) {
            return {type: 'boolean'};

        } else if (c.converter === ArrayConverter) {
            const itemConverterDefinition = normalizeConverter((c.options as ArrayConverterOptions).itemConverter);
            return {
                items: SwaggerTipifyUtil.buildOpenApiSchema(itemConverterDefinition, schemas),
                type: 'array',
            };

        } else if (c.converter === ObjectConverter) {

            const objectType = (c.options as ObjectConverterOptions).type;
            const mapping = JsonConverterMapper.getMappingForType(objectType);

            if (mapping) {

                if (!schemas[mapping.type.name]) {

                    const schema: OpenApiSchema = {
                        properties: {},
                        type: 'object',
                    };

                    if (!mapping.parent) {
                        schemas[mapping.type.name] = schema;

                    } else {
                        const parent = mapping.parent.type;
                        schemas[mapping.type.name] = {
                            allOf: [
                                {
                                    $ref: `#/components/schemas/${parent.name}`,
                                },
                                schema,
                            ],
                        };
                        SwaggerTipifyUtil.buildOpenApiSchema(parent, schemas);
                    }

                    for (const property of mapping.properties) {
                        schema.properties[property.serializedName] = SwaggerTipifyUtil.buildOpenApiSchema(
                            property.converterWithOptions,
                            schemas);
                    }
                }

                return {$ref: `#/components/schemas/${objectType.name}`};

            } else {
                return {type: 'object'};
            }
        }
    }

}

/**
 * Param options
 */
export interface ParamOptions {
    type: 'query' | 'path' | 'httpRequest' | 'httpReply' | 'body' | 'auth';
    name?: string;
    description?: string;
    paramType?: { new(): any };
}

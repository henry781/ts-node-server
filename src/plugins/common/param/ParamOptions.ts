/**
 * Param options
 */
export interface ParamOptions {
    type: 'query' | 'search' | 'path' | 'httpRequest' | 'httpReply' | 'body' | 'auth';
    name?: string;
    description?: string;
    paramType?: any;
}

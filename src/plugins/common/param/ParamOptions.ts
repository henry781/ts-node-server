/**
 * Param options
 */
import {TypeOrConverter} from 'tipify';

export interface ParamOptions {
    type: 'query' | 'search' | 'path' | 'httpRequest' | 'httpReply' | 'body' | 'auth' | 'logger' | 'instanceLogger';
    name?: string;
    description?: string;
    paramType?: TypeOrConverter;
}

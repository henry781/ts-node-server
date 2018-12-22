import {WebApplicationError} from '../../../error/WebApplicationError';

export class QuerySearchError extends WebApplicationError {

    constructor(message: string) {
        super(message, 400);
    }
}

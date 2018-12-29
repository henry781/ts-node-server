import {WebServiceError} from '../../../error/WebServiceError';

export class QuerySearchError extends WebServiceError {

    constructor(message: string) {
        super(message, 400);
    }
}

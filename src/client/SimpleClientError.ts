import {WebServiceError} from '../core/WebServiceError';

export class SimpleClientError extends WebServiceError {

    public readonly responseStatus: number;
    public readonly responseBody: any;

    constructor(message: string, status = 500, cause?: Error, responseStatus?: number, responseBody?: any) {
        super(message, status, cause);

        this.responseStatus = responseStatus;
        this.responseBody = responseBody;

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

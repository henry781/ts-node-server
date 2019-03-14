import {Response} from 'request';
import {WebServiceError} from '../error/WebServiceError';

export class GenericClientError extends WebServiceError {

    private _response: Response;

    public get response(): Response {
        return this._response;
    }

    private _body: any;

    public get body(): Error {
        return this._body;
    }

    constructor(message: string, status = 500, cause?: Error, response?: Response, body?: any) {
        super(message, status, cause);

        this._response = response;
        this._body = body;

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

import {inspect} from 'util';

export class WebServiceError extends Error {

    private _status: number;

    public get status(): number {
        return this._status;
    }

    private _cause: Error;

    public get cause(): Error {
        return this._cause;
    }

    constructor(message: string, status = 500, cause?: Error) {
        super(message);
        this._status = status;
        this._cause = cause;

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    public [inspect.custom || 'inspect']() {
        let err: Error | undefined = this.cause;
        let fullStack = this.stack;

        while (err) {
            fullStack += '\n\ncaused by:\n\n';
            fullStack += err.stack || err.message;

            err = (err as WebServiceError).cause;
        }
    }
}

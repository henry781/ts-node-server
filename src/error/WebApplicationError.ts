export class WebApplicationError extends Error {

    private _status: number;

    get status(): number {
        return this._status;
    }

    constructor(message: string, status = 500) {
        super(message);
        this._status = status;

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
import {Token} from 'auth-header';
import {PrincipalOptions} from './PrincipalOptions';

export class Principal {

    private _login: string;

    private _email: string;

    private _token: Token;

    constructor(options?: PrincipalOptions) {
        if (options) {
            this._login = options.login;
            this._email = options.email;
            this._token = options.token;
        }
    }
}

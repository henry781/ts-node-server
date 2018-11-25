import {Token} from 'auth-header';

export class Principal {

    private _login: string;

    private _token: Token;

    constructor(login: string, token: Token) {
        this._login = login;
        this._token = token;
    }
}

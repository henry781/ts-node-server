import {Token} from 'auth-header';
import {PrincipalOptions} from './PrincipalOptions';

export class Principal {

    private _login: string;

    private _email: string;

    private _token: Token;

    public get token(): Token {
        return this._token;
    }

    private _firstname: string;

    private _lastname: string;

    private _roles: string[];

    constructor(options?: PrincipalOptions) {
        if (options) {
            this._login = options.login;
            this._email = options.email;
            this._token = options.token;
            this._firstname = options.firstname;
            this._lastname = options.lastname;
            this._roles = options.roles;
        }
    }

    public hasRole(role: string): boolean {
        return this._roles && this._roles.indexOf(role) !== -1;
    }
}

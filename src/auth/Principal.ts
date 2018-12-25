import {Token} from 'auth-header';
import {PrincipalOptions} from './PrincipalOptions';

export class Principal {

    private _login: string;

    public get login(): string {
        return this._login;
    }

    private _email: string;

    public get email(): string {
        return this._email;
    }

    private _token: Token;

    public get token(): Token {
        return this._token;
    }

    private _firstname: string;

    public get firstname(): string {
        return this._firstname;
    }

    private _lastname: string;

    public get lastname(): string {
        return this._lastname;
    }

    private _roles: string[];

    public get roles(): string[] {
        return this._roles;
    }

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

    public hasRole(role: string | string[]): boolean {

        if (!this._roles) {
            return false;
        }

        if (Array.isArray(role)) {
            return this._roles.some((r) => role.indexOf(r) !== -1);
        } else {
            return this._roles.indexOf(role) !== -1;
        }
    }
}

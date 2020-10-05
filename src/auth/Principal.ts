import {Token} from 'auth-header';
import {any, arrayOf, jsonObject, jsonProperty, keyValueOf} from 'tipify';

@jsonObject()
export class Principal {

    @jsonProperty('login')
    private _login: string;

    public get login(): string {
        return this._login;
    }

    @jsonProperty('email')
    private _email: string;

    public get email(): string {
        return this._email;
    }

    private _token: Token;

    public get token(): Token {
        return this._token;
    }

    @jsonProperty('firstname')
    private _firstname: string;

    public get firstname(): string {
        return this._firstname;
    }

    @jsonProperty('lastname')
    private _lastname: string;

    public get lastname(): string {
        return this._lastname;
    }

    @jsonProperty('roles', arrayOf(String))
    private _roles: string[];

    public get roles(): string[] {
        return this._roles;
    }

    @jsonProperty('params', keyValueOf(String, any()))
    private _params: PrincipalParams;

    public get params(): PrincipalParams {
        return this._params;
    }

    constructor(options?: PrincipalOptions) {
        if (options) {
            this._login = options.login;
            this._email = options.email;
            this._token = options.token;
            this._firstname = options.firstname;
            this._lastname = options.lastname;
            this._roles = options.roles;
            this._params = options.params;

            if (options.password !== undefined) {
                const base64Token = Buffer.from(`${this._login}:${options.password}`).toString('base64');
                this._token = {scheme: 'Basic', token: base64Token, params: {}};
            }
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

export interface PrincipalOptions {
    login?: string;
    email?: string;
    token?: Token;
    password?: string;
    firstname?: string;
    lastname?: string;
    roles?: string[];
    params?: PrincipalParams;
}

export interface PrincipalParams {
    clientHeaders: { [key: string]: string };

    [key: string]: object;
}

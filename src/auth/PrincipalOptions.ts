import {Token} from 'auth-header';

export interface PrincipalOptions {
    login?: string;
    email?: string;
    token?: Token;
    firstname?: string;
    lastname?: string;
    roles?: string[];
}

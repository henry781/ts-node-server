import {Token} from 'auth-header';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {Principal} from './Principal';

/**
 * Auth provider
 */
export abstract class AuthProvider {

    public abstract getScheme(): string;

    public abstract authenticate(token: Token, options: AuthOptions): Principal;
}

import {Token} from 'auth-header';
import {AuthOptions} from '../plugins/common/method/AuthOptions';
import {Request} from '../types';
import {Principal} from './Principal';

/**
 * Auth provider
 */
export abstract class AuthProvider {
    public abstract authenticate(request: Request, token: Token, options: AuthOptions): Promise<Principal>;

    protected constructor(public name: string) {
    }
}

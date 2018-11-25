import {AuthProvider} from '../../../auth/AuthProvider';
import {AuthOptions} from './AuthOptions';

export interface AuthDefinition {
    provider: AuthProvider;
    options: AuthOptions;
}
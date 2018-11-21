import {HealthcheckResult} from './HealthcheckResult';

/**
 * Healthchecks should implement this interface
 */
export interface Healthcheck {

    /**
     * Healtcheck name
     * should be unique
     * @returns {string}
     */
    getName(): string;

    /**
     * Check method
     * @returns {Promise<HealthcheckResult>}
     */
    check(): Promise<HealthcheckResult>;
}

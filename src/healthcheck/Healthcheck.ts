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
     * @returns {Promise<any>}
     */
    check(): Promise<any>;
}

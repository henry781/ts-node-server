export interface HealthcheckResult {
    healthy: boolean;
    error?: Error;
    result?: object;
}

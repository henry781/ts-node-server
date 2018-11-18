export interface Healthcheck {

    getName(): string;

    check(): Promise<{
        healthy: true;
        content?: object;
    }>;
}

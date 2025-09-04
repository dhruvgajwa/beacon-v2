import type { AnalyticsService } from "./analytics.service";
export declare class AnalyticsController {
    private readonly analytics;
    constructor(analytics: AnalyticsService);
    track(body: {
        clientId: string;
        userId?: string;
        event: string;
        params?: Record<string, any>;
    }): Promise<{
        ok: boolean;
        reason: string;
        via?: undefined;
    } | {
        ok: boolean;
        via: string;
        reason?: undefined;
    } | {
        ok: boolean;
        error: string;
    }>;
}

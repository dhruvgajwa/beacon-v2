import type { ConfigService } from "@nestjs/config";
type TrackPayload = {
    clientId: string;
    userId?: string;
    event: string;
    params?: Record<string, any>;
};
export declare class AnalyticsService {
    private readonly config;
    private readonly gtmUrl?;
    private readonly ga4Mid?;
    private readonly ga4Secret?;
    private readonly enabled;
    constructor(config: ConfigService);
    private redact;
    track({ clientId, userId, event, params }: TrackPayload): Promise<{
        ok: boolean;
        reason: string;
        via?: undefined;
    } | {
        ok: boolean;
        via: string;
        reason?: undefined;
    }>;
}
export {};

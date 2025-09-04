import type { ConfigService } from "@nestjs/config";
type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
export declare class NewRelicService {
    private readonly config;
    private readonly logger;
    private readonly enabled;
    private readonly licenseKey?;
    private readonly endpoint;
    private readonly appName;
    constructor(config: ConfigService);
    redact(obj: any): any;
    log(level: LogLevel, message: string, attributes?: Record<string, any>): Promise<void>;
    logRequest(attributes: Record<string, any>): Promise<void>;
    logError(message: string, attributes?: Record<string, any>): Promise<void>;
}
export {};

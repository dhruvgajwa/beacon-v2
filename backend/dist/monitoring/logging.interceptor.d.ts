import { type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common";
import { type Observable } from "rxjs";
import type { NewRelicService } from "./newrelic.service";
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly nr;
    constructor(nr: NewRelicService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}

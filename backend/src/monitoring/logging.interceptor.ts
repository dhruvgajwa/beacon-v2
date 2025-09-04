import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  HttpException,
} from "@nestjs/common"
import { type Observable, tap, catchError, throwError } from "rxjs"
import type { NewRelicService } from "./newrelic.service"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly nr: NewRelicService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const req: any = context.switchToHttp().getRequest()
    const { method, originalUrl, headers, body, query } = req
    const user = req.user || {}

    return next.handle().pipe(
      tap((resBody) => {
        void this.nr.logRequest({
          method,
          url: originalUrl || req.url,
          status: req.res?.statusCode,
          duration_ms: Date.now() - now,
          userId: user?.sub,
          profileId: user?.profileId,
          headers: { authorization: headers?.authorization }, // will be redacted
          body,
          query,
        })
      }),
      catchError((err) => {
        const status = err instanceof HttpException ? err.getStatus?.() : req.res?.statusCode || 500
        void this.nr.logError("http_error", {
          method,
          url: originalUrl || req.url,
          status,
          duration_ms: Date.now() - now,
          userId: user?.sub,
          profileId: user?.profileId,
          headers: { authorization: headers?.authorization },
          body,
          query,
          error: {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
          },
        })
        return throwError(() => err)
      }),
    )
  }
}

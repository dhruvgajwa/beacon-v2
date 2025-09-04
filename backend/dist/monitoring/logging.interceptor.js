"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let LoggingInterceptor = class LoggingInterceptor {
    constructor(nr) {
        this.nr = nr;
    }
    intercept(context, next) {
        const now = Date.now();
        const req = context.switchToHttp().getRequest();
        const { method, originalUrl, headers, body, query } = req;
        const user = req.user || {};
        return next.handle().pipe((0, rxjs_1.tap)((resBody) => {
            var _a;
            void this.nr.logRequest({
                method,
                url: originalUrl || req.url,
                status: (_a = req.res) === null || _a === void 0 ? void 0 : _a.statusCode,
                duration_ms: Date.now() - now,
                userId: user === null || user === void 0 ? void 0 : user.sub,
                profileId: user === null || user === void 0 ? void 0 : user.profileId,
                headers: { authorization: headers === null || headers === void 0 ? void 0 : headers.authorization },
                body,
                query,
            });
        }), (0, rxjs_1.catchError)((err) => {
            var _a, _b;
            const status = err instanceof common_1.HttpException ? (_a = err.getStatus) === null || _a === void 0 ? void 0 : _a.call(err) : ((_b = req.res) === null || _b === void 0 ? void 0 : _b.statusCode) || 500;
            void this.nr.logError("http_error", {
                method,
                url: originalUrl || req.url,
                status,
                duration_ms: Date.now() - now,
                userId: user === null || user === void 0 ? void 0 : user.sub,
                profileId: user === null || user === void 0 ? void 0 : user.profileId,
                headers: { authorization: headers === null || headers === void 0 ? void 0 : headers.authorization },
                body,
                query,
                error: {
                    name: err === null || err === void 0 ? void 0 : err.name,
                    message: err === null || err === void 0 ? void 0 : err.message,
                    stack: err === null || err === void 0 ? void 0 : err.stack,
                },
            });
            return (0, rxjs_1.throwError)(() => err);
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map
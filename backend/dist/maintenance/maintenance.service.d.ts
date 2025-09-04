import type { Model } from "mongoose";
import type { UserAuthDocument } from "../auth/schemas/user-auth.schema";
export declare class MaintenanceService {
    private readonly logger;
    private userAuthModel;
    constructor(userAuthModel: Model<UserAuthDocument>);
    clearExpiredOtps(): Promise<void>;
}

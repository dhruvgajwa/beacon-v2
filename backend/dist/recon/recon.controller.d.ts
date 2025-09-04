import type { ReconService } from "./recon.service";
import type { ReconDto } from "./dto/recon.dto";
import type { PingDto } from "./dto/ping.dto";
export declare class ReconController {
    private readonly reconService;
    constructor(reconService: ReconService);
    recon(req: any, reconDto: ReconDto): Promise<{
        nearbyUsers: {
            id: unknown;
            distance: number;
            canSeeProfile: boolean;
            name: string;
            profilePic: string;
        }[];
    }>;
    ping(req: any, pingDto: PingDto): Promise<{
        message: string;
        requestId: unknown;
    }>;
    acceptPing(requestId: string, req: any): Promise<{
        message: string;
    }>;
    rejectPing(requestId: string, req: any): Promise<{
        message: string;
    }>;
    getPingRequests(req: any): Promise<{
        requests: {
            id: unknown;
            from: {
                id: unknown;
                name: string;
                phoneNumber: string;
                profilePic: string;
            };
            createdAt: Date;
        }[];
    }>;
    acceptReconAlias(req: any, body: {
        requestId: string;
    }): Promise<{
        message: string;
    }>;
    rejectReconAlias(req: any, body: {
        requestId: string;
    }): Promise<{
        message: string;
    }>;
}

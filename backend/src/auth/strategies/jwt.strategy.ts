import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { ConfigService } from "@nestjs/config"
import type { AuthService } from "../auth.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("jwt.secret"),
    })
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub)
    if (!user) {
      return null
    }
    return { ...user, sub: payload.sub, profileId: payload.profileId }
  }
}

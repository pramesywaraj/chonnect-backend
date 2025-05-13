import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from 'src/common/config/auth.config';
import AuthJwtPayload from '../types/jwt-payload.types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    _jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _jwtConfiguration.secret as string,
      ignoreExpiration: false,
    });
  }

  validate(payload: AuthJwtPayload) {
    return payload;
  }
}

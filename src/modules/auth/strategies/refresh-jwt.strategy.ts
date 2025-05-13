import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';

import { refreshJwtConfig } from '../../../common/config/auth.config';
import AuthJwtPayload from '../types/jwt-payload.types';

@Injectable()
export default class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    _refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _refreshJwtConfiguration.secret as string,
    });
  }

  validate(payload: AuthJwtPayload) {
    return payload;
  }
}

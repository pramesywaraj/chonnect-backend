import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { refreshJwtConfig } from '../../../common/config/auth.config';
import { AuthJwtPayload } from '../../../types/auth.type';
import AuthService from '../auth.service';

@Injectable()
export default class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    _refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,

    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: _refreshJwtConfiguration.secret as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();
    if (!refreshToken) throw new BadRequestException('Refresh token not found in the header!');

    const userId = payload.sub;

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}

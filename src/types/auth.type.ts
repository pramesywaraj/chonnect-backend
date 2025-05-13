export interface AuthJwtPayload {
  sub: string;
  email: string;
}

export interface AuthRequest {
  user: AuthJwtPayload;
}

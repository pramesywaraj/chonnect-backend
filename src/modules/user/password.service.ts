import * as bcrypt from 'bcrypt';

export default class PasswordService {
  private readonly SALT_ROUND = 10;

  public async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUND);
  }

  public async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

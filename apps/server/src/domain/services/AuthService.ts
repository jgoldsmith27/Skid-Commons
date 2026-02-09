import type { UserView } from '@skid/shared/types';
import type { FastifyJWT } from '@fastify/jwt';
import type { UserRepository } from '../repositories/UserRepository.js';

export interface TokenSigner {
  sign(payload: FastifyJWT['payload']): string;
}

// Service Layer Pattern: auth use-cases independent of transport.
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenSigner: TokenSigner
  ) {}

  private toUserView(user: { id: string; accountId: string; displayName: string }): UserView {
    return {
      id: user.id,
      accountId: user.accountId,
      displayName: user.displayName
    };
  }

  async register(accountId: string, displayName: string): Promise<{ token: string; user: UserView }> {
    const existing = await this.userRepository.findByAccountId(accountId);
    if (existing) {
      throw new Error('accountId already exists');
    }

    const user = await this.userRepository.create({ accountId, displayName });
    const token = this.tokenSigner.sign({ userId: user.id, accountId: user.accountId });

    return {
      token,
      user: this.toUserView(user)
    };
  }

  async login(accountId: string): Promise<{ token: string; user: UserView }> {
    const user = await this.userRepository.findByAccountId(accountId);
    if (!user) {
      throw new Error('accountId not found');
    }

    const token = this.tokenSigner.sign({ userId: user.id, accountId: user.accountId });

    return {
      token,
      user: this.toUserView(user)
    };
  }
}

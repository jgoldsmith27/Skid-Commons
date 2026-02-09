import type { UserEntity } from '../entities/models.js';

export interface UserRepository {
  create(input: { accountId: string; displayName: string }): Promise<UserEntity>;
  findByAccountId(accountId: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
}

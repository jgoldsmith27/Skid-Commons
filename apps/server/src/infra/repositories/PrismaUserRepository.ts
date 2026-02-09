import type { PrismaClient } from '@prisma/client';
import type { UserRepository } from '../../domain/repositories/UserRepository.js';
import type { UserEntity } from '../../domain/entities/models.js';

// Repository Pattern: Prisma implementation hidden behind domain interface.
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: { accountId: string; displayName: string }): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        accountId: input.accountId,
        displayName: input.displayName
      }
    });
  }

  async findByAccountId(accountId: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { accountId } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}

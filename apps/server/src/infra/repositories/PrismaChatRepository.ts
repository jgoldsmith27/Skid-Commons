import type { ParticipantRole } from '@skid/shared/types';
import type { PrismaClient } from '@prisma/client';
import type { ChatRepository } from '../../domain/repositories/ChatRepository.js';
import type { ChatEntity, UserEntity } from '../../domain/entities/models.js';

export class PrismaChatRepository implements ChatRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: { title?: string; createdByUserId: string }): Promise<ChatEntity> {
    return this.prisma.chat.create({
      data: {
        title: input.title ?? null,
        createdByUserId: input.createdByUserId
      }
    });
  }

  async listForUser(userId: string): Promise<{ owned: ChatEntity[]; shared: ChatEntity[] }> {
    const participations = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: { chat: true }
    });

    const owned: ChatEntity[] = [];
    const shared: ChatEntity[] = [];

    for (const participation of participations) {
      if (participation.role === 'OWNER') {
        owned.push(participation.chat);
      } else {
        shared.push(participation.chat);
      }
    }

    return { owned, shared };
  }

  async findById(chatId: string): Promise<ChatEntity | null> {
    return this.prisma.chat.findUnique({ where: { id: chatId } });
  }

  async addParticipant(input: { chatId: string; userId: string; role: ParticipantRole }): Promise<void> {
    await this.prisma.chatParticipant.upsert({
      where: {
        chatId_userId: {
          chatId: input.chatId,
          userId: input.userId
        }
      },
      create: {
        chatId: input.chatId,
        userId: input.userId,
        role: input.role
      },
      update: {
        role: input.role
      }
    });
  }

  async getParticipantRole(chatId: string, userId: string): Promise<ParticipantRole | null> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });

    return participant?.role ?? null;
  }

  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { chatId_userId: { chatId, userId } }
    });

    return Boolean(participant);
  }

  async listParticipants(chatId: string): Promise<Array<{ user: UserEntity; role: ParticipantRole }>> {
    const rows = await this.prisma.chatParticipant.findMany({
      where: { chatId },
      include: { user: true }
    });

    return rows.map((row) => ({
      role: row.role,
      user: row.user
    }));
  }
}

import type { AuthorType } from '@skid/shared/types';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { MessageRepository, MessageWithAuthor } from '../../domain/repositories/MessageRepository.js';

export class PrismaMessageRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toMessageWithAuthor(
    row: Prisma.MessageGetPayload<{ include: { author: { select: { displayName: true } } } }>
  ): MessageWithAuthor {
    return {
      id: row.id,
      chatId: row.chatId,
      authorUserId: row.authorUserId,
      authorType: row.authorType,
      content: row.content,
      createdAt: row.createdAt,
      authorDisplayName: row.author?.displayName ?? 'Skid Commons'
    };
  }

  async create(input: {
    chatId: string;
    authorUserId: string | null;
    authorType: AuthorType;
    content: string;
  }): Promise<MessageWithAuthor> {
    const row = await this.prisma.message.create({
      data: {
        chatId: input.chatId,
        authorUserId: input.authorUserId,
        authorType: input.authorType,
        content: input.content
      },
      include: {
        author: {
          select: {
            displayName: true
          }
        }
      }
    });

    return this.toMessageWithAuthor(row);
  }

  async listByChat(chatId: string): Promise<MessageWithAuthor[]> {
    const rows = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            displayName: true
          }
        }
      }
    });

    return rows.map((row) => this.toMessageWithAuthor(row));
  }

  async listRecentByChat(chatId: string, limit: number): Promise<MessageWithAuthor[]> {
    const rows = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        author: {
          select: {
            displayName: true
          }
        }
      }
    });

    return rows.reverse().map((row) => this.toMessageWithAuthor(row));
  }
}

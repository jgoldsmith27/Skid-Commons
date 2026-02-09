import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthService } from '../../domain/services/AuthService.js';
import { LoginDto, RegisterDto } from '../dtos/authDtos.js';
import { parseDto } from '../dtos/parse.js';

// Controller/Router Pattern: HTTP controller delegates to service layer.
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = parseDto(RegisterDto, request.body);
    const result = await this.authService.register(body.accountId, body.displayName);
    reply.send(result);
  };

  login = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const body = parseDto(LoginDto, request.body);
    const result = await this.authService.login(body.accountId);
    reply.send(result);
  };
}

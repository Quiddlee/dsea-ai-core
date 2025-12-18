import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AiCoreInternalAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-ai-core-token'];

    if (!token || token !== process.env.AI_CORE_INTERNAL_TOKEN) {
      throw new UnauthorizedException('Invalid internal token');
    }

    return true;
  }
}

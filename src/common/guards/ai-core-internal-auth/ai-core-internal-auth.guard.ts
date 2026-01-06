import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { AppConfig } from '../../types/environment';
import { appConfiguration } from 'src/common/config/app.config';

@Injectable()
export class AiCoreInternalAuthGuard implements CanActivate {
  constructor(
    @Inject(appConfiguration.KEY)
    private readonly appConfig: AppConfig,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-ai-core-token'];

    if (!token || token !== this.appConfig.aiCoreInternalToken) {
      throw new UnauthorizedException('Invalid internal token');
    }

    return true;
  }
}

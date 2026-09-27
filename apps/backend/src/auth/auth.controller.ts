// apps/backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginDto, RefreshDto, SwitchContextDto } from './dto/auth.dto';
import { JwtAuthGuard, Public } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '@lookara/auth';

@Controller('api/v1/auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub, user.activeOrganizationId);
  }

  @Post('switch-context')
  @HttpCode(HttpStatus.OK)
  async switchContext(
    @CurrentUser() user: JwtPayload,
    @Body() switchDto: SwitchContextDto,
  ) {
    return this.authService.switchContext(user.sub, switchDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }
}

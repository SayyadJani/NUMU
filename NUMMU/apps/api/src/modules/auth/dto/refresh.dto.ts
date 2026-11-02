import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @ApiPropertyOptional({
    description:
      'Refresh token string (optional when using HttpOnly cookie numu_refresh_token)',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

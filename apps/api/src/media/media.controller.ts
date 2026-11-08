import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthUser } from '@harmonize/shared';
import { IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { AdminGuard, CurrentUser } from '../auth/auth.guard';
import { MAX_UPLOAD_BYTES, MediaService } from './media.service';

class UploadDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;
}

class UpdateMediaDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  /** "x% y%", or null to go back to the center. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Matches(/^\d{1,3}% \d{1,3}%$/, { message: 'Ponto de foco inválido.' })
  focus?: string | null;
}

@Controller('admin/media')
@UseGuards(AdminGuard)
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list(@Query('limit') limit?: string, @Query('before') before?: string) {
    const n = Math.min(Math.max(Number(limit) || 60, 1), 200);
    return this.media.list(n, before ? Number(before) : undefined);
  }

  @Post()
  // No `dest`: multer keeps the file in memory, which is all a serverless function has.
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  upload(@UploadedFile() file: Express.Multer.File | undefined, @Body() dto: UploadDto, @CurrentUser() user: AuthUser) {
    return this.media.upload(file, dto.alt ?? '', user.id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMediaDto) {
    return this.media.update(id, dto.alt, dto.focus);
  }

  @Get(':id/usage')
  usage(@Param('id', ParseIntPipe) id: number) {
    return this.media.usage(id);
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.media.delete(id);
  }
}

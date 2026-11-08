import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @MaxLength(190)
  email: string;

  @IsString()
  @MinLength(1, { message: 'Informe a senha.' })
  @MaxLength(200)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  captchaToken?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MaxLength(200)
  currentPassword: string;

  @IsString()
  @MinLength(10, { message: 'A nova senha precisa ter pelo menos 10 caracteres.' })
  @MaxLength(200)
  newPassword: string;
}

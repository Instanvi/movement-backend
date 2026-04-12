import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SendInvitationDto {
  @ApiProperty({ example: 'staff@church.org' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'pastor' })
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class InvitationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  churchId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

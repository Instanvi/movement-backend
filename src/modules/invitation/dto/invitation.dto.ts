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

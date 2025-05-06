import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {

  @ApiProperty({
    description: 'Username',
    type: String,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'User Email',
    type: String,
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User Password',
    type: String,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak, it must contain at least one uppercase letter, one lowercase letter and one number or special character',
  })
  password: string;

}
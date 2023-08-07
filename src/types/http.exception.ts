import { HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class MyHttpException extends HttpException {
  @ApiProperty({
    description: 'Error message',
  })
  message: string;

  @ApiProperty({
    description: 'Error description',
  })
  error?: string;

  @ApiProperty({
    description: 'Error status code',
  })
  statusCode: number;

  constructor(message, statusCode) {
    super(message, statusCode);
  }
}

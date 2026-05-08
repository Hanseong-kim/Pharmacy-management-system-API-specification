import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = exception as any;

    let status = HttpStatus.BAD_REQUEST;
    let message = '데이터베이스 처리 중 오류가 발생했습니다.';

    switch (err.code) {
      case '23503': // foreign_key_violation
        message = '연결된 데이터가 있어 처리가 불가능합니다.';
        break;
      case '23505': // unique_violation
        message = '이미 존재하는 데이터입니다.';
        break;
      case '23502': // not_null_violation
        message = '필수 값이 누락되었습니다.';
        break;
      case '22P02': // invalid_text_representation (e.g. bad enum)
        message = '입력값 형식이 올바르지 않습니다.';
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = '서버 내부 오류가 발생했습니다.';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: status === HttpStatus.BAD_REQUEST ? 'Bad Request' : 'Internal Server Error',
    });
  }
}

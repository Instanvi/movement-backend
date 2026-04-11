import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

function isMessageDataShape(
  val: unknown,
): val is { message: string; data: unknown } {
  return (
    typeof val === 'object' &&
    val !== null &&
    'message' in val &&
    'data' in val &&
    typeof (val as { message: unknown }).message === 'string'
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((raw: unknown) => {
        let message = 'Operation successful';
        let resData: unknown = raw;

        if (isMessageDataShape(raw)) {
          message = raw.message;
          resData = raw.data;
        }

        const payload: Response<T> = {
          success: true,
          message,
          data: (resData ?? null) as T,
          timestamp: new Date().toISOString(),
        };
        return payload;
      }),
    );
  }
}

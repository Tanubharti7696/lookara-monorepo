// apps/backend/src/common/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta: Record<string, any>;
  errors: any[];
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // If response already matches standard envelope, return as-is
        if (response && typeof response === 'object' && 'data' in response && 'errors' in response) {
          return response;
        }

        // If response has { data, meta } structure
        if (response && typeof response === 'object' && 'data' in response) {
          return {
            data: response.data,
            meta: response.meta || {},
            errors: [],
          };
        }

        return {
          data: response ?? null,
          meta: {},
          errors: [],
        };
      }),
    );
  }
}

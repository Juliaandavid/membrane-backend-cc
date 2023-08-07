import {
  PipeTransform,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class OperationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const operation = value.toLowerCase();
    if (operation !== 'buy' && operation !== 'sell') {
      throw new NotAcceptableException('Invalid operation');
    }
    return operation;
  }
}

import {
  PipeTransform,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import Decimal from 'decimal.js';

@Injectable()
export class AmountPipe implements PipeTransform<string, Decimal> {
  transform(value: string): Decimal {
    const decimalValue = new Decimal(value);
    if (decimalValue.isNaN() || decimalValue.isNegative()) {
      throw new NotAcceptableException('Invalid amount');
    }
    return decimalValue;
  }
}

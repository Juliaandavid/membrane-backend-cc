import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class PairPipe implements PipeTransform<string, string> {
  transform(pair: string): string {
    return pair.replace(/\\|-|_/g, '').toUpperCase();
  }
}

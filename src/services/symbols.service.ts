import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { BITFINEX_PUBLIC_HTTP } from '../types/providers';

@Injectable()
export class SymbolsService {
  constructor(@Inject(BITFINEX_PUBLIC_HTTP) private http: AxiosInstance) {}

  async pairIsValid(pair: string): Promise<boolean> {
    try {
      const response = await this.http.get(`/symbols`);
      return response.data.includes(pair.toLowerCase());
    } catch (e) {
      console.log(e.response?.data ?? e.message);
      throw new BadGatewayException('Exchange is not available');
    }
  }
}

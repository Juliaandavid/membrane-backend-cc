import { Injectable } from '@nestjs/common';
import { OrderbookService } from './orderbook.service';
import Decimal from 'decimal.js';
import { OrderBookBestPrices } from 'src/types/orderbook';

@Injectable()
export class MarketService {
  constructor(private orderbookService: OrderbookService) {}

  async getOrderBookTips(pair: string): Promise<OrderBookBestPrices> {
    if (!this.orderbookService.pairExists(pair))
      await this.orderbookService.addPair(pair);

    return this.orderbookService.getOrderBookTips(pair);
  }

  async getOrderbookPrice(
    pair: string,
    operation: string,
    amount: Decimal,
  ): Promise<number> {
    if (!this.orderbookService.pairExists(pair))
      await this.orderbookService.addPair(pair);

    return this.orderbookService.getOrderbookPriceSnapshot(
      pair,
      operation,
      amount,
    );
  }
}

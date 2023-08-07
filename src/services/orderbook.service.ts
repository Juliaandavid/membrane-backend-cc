import {
  BadRequestException,
  Inject,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as WS from 'ws';
import Decimal from 'decimal.js';
import {
  OrderBook,
  BitfinexOrderBookRequest,
  BitfinexOrderBookResponse,
  OrderBookBestPrices,
  OrderBookPrice,
} from 'src/types/orderbook';
import { SymbolsService } from './symbols.service';
import { BITFINEX_ORDERBOOKS_WS } from '../types/providers';

@Injectable()
export class OrderbookService {
  private channels: Record<number, string> = {};
  private orderBooks: Record<number, OrderBook> = {};

  constructor(
    private config: ConfigService,
    private symbolService: SymbolsService,
    @Inject(BITFINEX_ORDERBOOKS_WS) private ws: WS,
  ) {
    this.ws.on('open', this.onOpen.bind(this));
    this.ws.on('message', this.onMessage.bind(this));
    this.ws.on('error', console.error);
    setInterval(() => {
      console.log(
        new Date().getTime(),
        '[orderbooks]',
        JSON.stringify(this.channels),
        JSON.stringify(this.orderBooks),
      );
    }, 10000);
  }

  private onOpen() {
    console.log(new Date().getTime(), 'open');
    const defaultPairs = this.config.get('DEFAULT_PAIRS').split(',');
    defaultPairs.forEach((pair: string) => this.addPair(pair));
  }

  private onMessage(data: WS.Data) {
    const payload: any[] | BitfinexOrderBookResponse = JSON.parse(
      data.toString(),
    );
    if (Array.isArray(payload)) {
      if (Array.isArray(payload[1][0])) {
        payload[1].forEach((item: number[]) =>
          this.processUpdate(payload[0], item),
        );
      } else {
        if (payload[1] === 'hb') return;
        this.processUpdate(payload[0], payload[1]);
      }
    } else {
      if (payload.event === 'subscribed') {
        console.log(new Date().getTime(), JSON.stringify(payload));
        this.channels[payload.chanId] = payload.pair;
      }
    }
  }

  pairExists(pair: string): boolean {
    for (const channelId in this.channels) {
      if (this.channels[channelId] === pair) return true;
    }
    return false;
  }

  async addPair(pair: string) {
    if (!(await this.symbolService.pairIsValid(pair)))
      throw new NotAcceptableException('Pair is not available.');

    const body: BitfinexOrderBookRequest = {
      event: 'subscribe',
      channel: 'book',
      symbol: `t${pair}`,
      prec: 'P0',
      freq: 'F0',
      len: this.config.get('ORDERBOOK_LENGTH'),
    };
    console.log(new Date().getTime(), JSON.stringify(body));
    this.ws.send(JSON.stringify(body));

    while (!this.pairExists(pair)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private processUpdate(channelId: number, payload: number[]) {
    const [price, count, amount] = payload;
    if (!this.orderBooks[channelId])
      this.orderBooks[channelId] = {
        bids: {},
        asks: {},
      };

    const book = this.orderBooks[channelId];

    if (!count) {
      let found = true;

      if (amount > 0) {
        if (book['bids'][price]) delete book['bids'][price];
        else found = false;
      } else if (amount < 0) {
        if (book['asks'][price]) delete book['asks'][price];
        else found = false;
      }

      if (!found) console.info(new Date().getTime(), 'not found', payload);
    } else {
      const side = amount >= 0 ? 'bids' : 'asks';
      book[side][price] = [price, count, Math.abs(amount)];
    }
  }

  async getOrderBookTips(pair: string): Promise<OrderBookBestPrices> {
    const channelId = Object.keys(this.channels).find(
      (channelId) => this.channels[channelId] === pair,
    );
    const orderBook = this.orderBooks[channelId];
    const bids = Object.entries<number[]>(orderBook.bids)
      .map<OrderBookPrice>(([price, rest]) => ({
        price: parseFloat(price),
        count: rest[1],
        amount: rest[2],
      }))
      .sort(({ price: priceA }, { price: priceB }) => priceB - priceA)
      .slice(0, 10);
    const asks = Object.entries(orderBook.asks)
      .map<OrderBookPrice>(([price, rest]) => ({
        price: parseFloat(price),
        count: rest[1],
        amount: rest[2],
      }))
      .sort(({ price: priceA }, { price: priceB }) => priceA - priceB)
      .slice(0, 10);

    return { bids, asks };
  }

  async getOrderbookPriceSnapshot(
    pair: string,
    operation: string,
    amount: Decimal,
  ): Promise<number> {
    const channelId = Object.keys(this.channels).find(
      (channelId) => this.channels[channelId] === pair,
    );
    const orderBook = this.orderBooks[channelId];
    const orders =
      operation === 'buy'
        ? Object.entries(orderBook.asks)
        : Object.entries(orderBook.bids);
    const sortedOrders = orders
      .map<number[]>(([price, size]) => [
        parseFloat(price),
        ...(size as number[]),
      ])
      .sort(([priceA], [priceB]) =>
        operation === 'buy' ? priceA - priceB : priceB - priceA,
      );

    let remainingAmount = new Decimal(amount);
    let totalPrice = new Decimal(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [price, _, amount] of sortedOrders) {
      if (remainingAmount.lessThanOrEqualTo(0)) break;
      const orderAmount = Math.min(remainingAmount.toNumber(), amount);
      remainingAmount = remainingAmount.minus(orderAmount);
      totalPrice = totalPrice.plus(orderAmount * price);
    }
    if (remainingAmount.greaterThan(0)) {
      throw new BadRequestException(
        `Insufficient liquidity to fill order for ${amount} ${pair} at ${operation} price`,
      );
    }
    return totalPrice.dividedBy(amount).toNumber();
  }
}

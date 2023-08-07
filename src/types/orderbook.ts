import { ApiProperty } from '@nestjs/swagger';

export interface BitfinexOrderBookRequest {
  event: string;
  channel: string;
  symbol: string;
  prec: string;
  freq: string;
  len: string;
  subId?: number;
}

export interface BitfinexOrderBookResponse {
  event: string;
  channel: string;
  chanId: number;
  symbol: string;
  prec: string;
  freq: string;
  len: string;
  pair: string;
  subId?: number;
}

export class OrderBook {
  bids: { [price: number]: number[] };
  asks: { [price: number]: number[] };
}

export class OrderBookPrice {
  @ApiProperty({
    description: 'Price',
    type: Number,
  })
  price: number;

  @ApiProperty({
    description: 'Count',
    type: Number,
  })
  count: number;

  @ApiProperty({
    description: 'Amount',
    type: Number,
  })
  amount: number;
}

export class OrderBookBestPrices {
  @ApiProperty({
    description: 'Best bid prices',
    type: [OrderBookPrice],
  })
  bids: OrderBookPrice[];

  @ApiProperty({
    description: 'Best ask prices',
    type: [OrderBookPrice],
  })
  asks: OrderBookPrice[];
}

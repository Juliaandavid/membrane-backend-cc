import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import Decimal from 'decimal.js';
import { AmountPipe } from 'src/pipes/amount.pipe';
import { OperationPipe } from 'src/pipes/operation.pipe';
import { PairPipe } from 'src/pipes/pair.pipe';
import { MarketService } from 'src/services/market.service';
import { MyHttpException } from 'src/types/http.exception';
import { OrderBookBestPrices } from 'src/types/orderbook';

@ApiTags('Orderbooks')
@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly marketService: MarketService) {}

  /**
   * Get the orderbook tips for a given pair
   * @param pair - The trading pair to get the orderbook tips for
   * @returns The orderbook tips for the given pair
   */
  @Get(':pair')
  @ApiOperation({
    summary: 'Get the orderbook tips for a given pair',
  })
  @ApiOkResponse({ type: OrderBookBestPrices })
  @ApiNotAcceptableResponse({ type: MyHttpException })
  @ApiParam({
    type: String,
    name: 'pair',
    description: 'The trading pair to get the orderbook tips for.',
    example: 'BTC_USD',
  })
  getOrderbookTips(
    @Param('pair', PairPipe) pair: string,
  ): Promise<OrderBookBestPrices> {
    return this.marketService.getOrderBookTips(pair);
  }

  /**
   * Get the orderbook price for a given pair, operation and amount
   * @param pair - The trading pair to get the orderbook price for
   * @param operation - The operation to perform on the orderbook (buy or sell)
   * @param amount - The amount to perform the operation on
   * @returns The orderbook price for the given pair, operation and amount
   */
  @Get(':pair/:operation/:amount')
  @ApiOperation({
    summary: 'Get the orderbook price for a given pair, operation and amount',
  })
  @ApiOkResponse({ type: Number })
  @ApiNotAcceptableResponse({ type: MyHttpException })
  @ApiParam({
    type: String,
    name: 'pair',
    description: 'The trading pair to get the orderbook price for.',
    example: 'BTC_USD',
  })
  @ApiParam({
    type: String,
    name: 'operation',
    description: 'The operation to perform on the orderbook (buy or sell).',
    examples: { buy: { value: 'buy' }, sell: { value: 'sell' } },
  })
  @ApiParam({
    type: Number,
    name: 'amount',
    description: 'The amount to perform the operation on.',
    example: 1.5,
  })
  getOrderbookPrice(
    @Param('pair', PairPipe) pair: string,
    @Param('operation', OperationPipe) operation: string,
    @Param('amount', AmountPipe) amount: Decimal,
  ): Promise<number> {
    return this.marketService.getOrderbookPrice(pair, operation, amount);
  }
}

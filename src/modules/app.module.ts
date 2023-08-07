import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as WS from 'ws';
import { OrderbookController } from 'src/controllers/orderbook.controller';
import { SymbolsService } from 'src/services/symbols.service';
import { OrderbookService } from 'src/services/orderbook.service';
import { MarketService } from 'src/services/market.service';
import {
  BITFINEX_ORDERBOOKS_WS,
  BITFINEX_PUBLIC_HTTP,
} from 'src/types/providers';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [OrderbookController],
  providers: [
    {
      provide: BITFINEX_PUBLIC_HTTP,
      inject: [ConfigService],
      useFactory: async (config) =>
        axios.create({ baseURL: config.get('BITFINEX_HTTP_URL') }),
    },
    {
      provide: BITFINEX_ORDERBOOKS_WS,
      inject: [ConfigService],
      useFactory: async (config) => new WS(config.get('BITFINEX_WS_URL')),
    },
    SymbolsService,
    OrderbookService,
    MarketService,
  ],
})
export class AppModule {}

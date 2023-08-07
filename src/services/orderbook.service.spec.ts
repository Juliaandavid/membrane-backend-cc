import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderbookService } from './orderbook.service';
import { SymbolsService } from './symbols.service';
import {
  BITFINEX_ORDERBOOKS_WS,
  BITFINEX_PUBLIC_HTTP,
} from '../types/providers';

describe('OrderbookService', () => {
  let orderbookService: OrderbookService;
  let symbolsService: SymbolsService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        OrderbookService,
        SymbolsService,
        {
          provide: BITFINEX_PUBLIC_HTTP,
          useValue: {
            get: jest.fn().mockResolvedValue({
              status: 200,
              data: ['btcusd', 'ethusd', 'ethbtc'],
            }),
          },
        },
        {
          provide: BITFINEX_ORDERBOOKS_WS,
          useValue: {
            on: jest.fn(),
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    orderbookService = module.get<OrderbookService>(OrderbookService);
    symbolsService = module.get<SymbolsService>(SymbolsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('addPair', () => {
    it('should throw an error if the pair is not valid', async () => {
      jest.spyOn(symbolsService, 'pairIsValid').mockResolvedValue(false);

      await expect(orderbookService.addPair('invalidPair')).rejects.toThrow(
        'Pair is not available',
      );
    });

    it('should subscribe to the pair and wait for it to exist', async () => {
      jest.spyOn(symbolsService, 'pairIsValid').mockResolvedValue(true);
      jest.spyOn(configService, 'get').mockReturnValue('BTCUSD,ETHUSD');

      const pair = 'BTCUSD';
      setTimeout(() => console.log('asdasdas'), 2000);
      await orderbookService.addPair(pair);

      expect(orderbookService.pairExists).toBeCalled();
    }, 30000);
  });

  describe('pairExists', () => {
    it('should return true if the pair exists', () => {
      orderbookService['channels'] = {
        1: 'BTCUSD',
      };

      expect(orderbookService.pairExists('BTCUSD')).toBe(true);
    });

    it('should return false if the pair does not exist', () => {
      orderbookService['channels'] = {
        1: 'validPair',
      };

      expect(orderbookService.pairExists('invalidPair')).toBe(false);
    });
  });

  describe('processUpdate', () => {
    it('should add a new order book if it does not exist', () => {
      const channelId = 1;
      const payload = [100, 1, 10];
      orderbookService['orderBooks'] = {};
      orderbookService['processUpdate'](channelId, payload);

      expect(
        JSON.stringify(orderbookService['orderBooks'][channelId].bids),
      ).toEqual('{"100":[100,1,10]}');
    });

    it('should remove an order book if count is 0', () => {
      const channelId = 1;
      const payload = [100, 0, 10];

      orderbookService['orderBooks'] = {
        [channelId]: {
          bids: {
            100: [10],
          },
          asks: {},
        },
      };

      orderbookService['processUpdate'](channelId, payload);
      expect(
        JSON.stringify(orderbookService['orderBooks'][channelId].bids),
      ).toEqual('{}');
    });
  });
});

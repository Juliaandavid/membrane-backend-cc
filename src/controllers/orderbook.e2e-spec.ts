import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../modules/app.module';

describe('OrderbookController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/orderbook/:pair (GET)', () => {
    it('should return the orderbook tips for the given pair', async () => {
      const response = await request(app.getHttpServer()).get(
        '/orderbook/BTC_USD',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bids');
      expect(response.body).toHaveProperty('asks');
    });
  });

  describe('/orderbook/:pair/:operation/:amount (GET)', () => {
    it('should return the orderbook price for the given pair, operation and amount', async () => {
      const response = await request(app.getHttpServer()).get(
        '/orderbook/BTC_USD/buy/1',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('price');
    });
  });
});

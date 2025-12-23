import { Test, TestingModule } from '@nestjs/testing';
import { CampeonatosController } from './campeonatos.controller';

describe('CampeonatosController', () => {
  let controller: CampeonatosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampeonatosController],
    }).compile();

    controller = module.get<CampeonatosController>(CampeonatosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

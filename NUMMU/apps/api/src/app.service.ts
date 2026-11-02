import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'NUMU API',
      version: '1.0.0',
      description: 'NUMU Developer Platform API Backend',
      docs: '/api/docs',
    };
  }
}

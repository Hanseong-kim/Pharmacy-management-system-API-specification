// src/modules/sales/sales.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(AuthGuard('jwt'))
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  createSale(@Request() req: any, @Body() body: { medicineId: number, quantity: number }) {
    // req.user는 JwtStrategy에서 반환한 { userId, role... } 정보가 들어있습니다.
    const staffId = req.user.userId; 
    return this.salesService.processSale(body.medicineId, body.quantity, staffId);
  }
}
import { Injectable } from '@nestjs/common';
import { DeliveryOptionDto, UpdateDeliverySettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  private deliverySettings = {
    insideDhakaFee: 120,
    outsideDhakaFee: 150,
    freeDeliveryThreshold: 5000,
    defaultCourier: 'Pathao Courier',
    estimatedTime: '2–4 business days',
    options: [
      {
        id: 'standard',
        label: 'Standard Doorstep Delivery',
        body: '3–5 working days across Bangladesh',
        price: 120,
        active: true,
      },
      {
        id: 'express',
        label: 'Express Dhaka Delivery',
        body: 'Guaranteed 24–48 hours in Dhaka metro',
        price: 200,
        active: true,
      },
      {
        id: 'pickup',
        label: 'Studio Collection (Mirpur)',
        body: 'Ready next business day · Free',
        price: 0,
        active: true,
      },
    ],
  };

  /* ── Get Delivery Settings (Public & Admin) ── */
  getDeliverySettings() {
    return this.deliverySettings;
  }

  /* ── Update Delivery Settings (Admin) ── */
  updateDeliverySettings(dto: UpdateDeliverySettingsDto) {
    this.deliverySettings = {
      insideDhakaFee: Number(dto.insideDhakaFee),
      outsideDhakaFee: Number(dto.outsideDhakaFee),
      freeDeliveryThreshold: Number(dto.freeDeliveryThreshold),
      defaultCourier: dto.defaultCourier || this.deliverySettings.defaultCourier,
      estimatedTime: dto.estimatedTime || this.deliverySettings.estimatedTime,
      options:
        dto.options && dto.options.length > 0
          ? dto.options.map((o) => ({ ...o, active: o.active ?? true }))
          : this.deliverySettings.options,
    };

    return {
      message: 'Delivery settings updated successfully.',
      data: this.deliverySettings,
    };
  }
}

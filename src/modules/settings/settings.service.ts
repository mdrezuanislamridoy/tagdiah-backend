import { Injectable } from '@nestjs/common';
import { DeliveryOptionDto, UpdateDeliverySettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  private settings = {
    store: {
      name: 'Tagdiah Home Decor & Arts',
      tagline: 'Handcrafted wall décor, porda and decorative arts',
      description:
        'Tagdiah curates handmade home décor from artisans across Bangladesh — canvas art, embroidered door curtains, ceramics and wood craft, made to warm up everyday spaces.',
      currency: 'BDT (৳)',
      timeZone: 'Asia/Dhaka (GMT+6)',
    },
    contact: {
      supportEmail: 'tagdiah.bd@gmail.com',
      supportHotline: '01332-131386',
      whatsappNumber: '01332-131386',
      storeAddress: 'Dewgaon, Rajashion, Savar, Dhaka 1340, Bangladesh',
    },
    delivery: {
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
          label: 'Studio Collection (Savar)',
          body: 'Ready next business day · Free',
          price: 0,
          active: true,
        },
      ],
    },
    payment: {
      codEnabled: true,
      bkash: false,
      card: false,
      allowDiscounts: true,
    },
    tax: {
      vatRate: 7.5,
      vatRegNumber: 'BIN 004312998-0201',
      taxInclusive: true,
    },
    notifications: {
      orderEmail: true,
      lowStock: true,
      reviewAlert: false,
      marketing: true,
    },
    security: {
      twoFactor: false,
    },
  };

  /* ── Get All Settings ── */
  getAllSettings() {
    return this.settings;
  }

  /* ── Get Delivery Settings (Public) ── */
  getDeliverySettings() {
    return this.settings.delivery;
  }

  /* ── Update Delivery Settings ── */
  updateDeliverySettings(dto: UpdateDeliverySettingsDto) {
    this.settings.delivery = {
      insideDhakaFee: Number(dto.insideDhakaFee ?? this.settings.delivery.insideDhakaFee),
      outsideDhakaFee: Number(dto.outsideDhakaFee ?? this.settings.delivery.outsideDhakaFee),
      freeDeliveryThreshold: Number(dto.freeDeliveryThreshold ?? this.settings.delivery.freeDeliveryThreshold),
      defaultCourier: dto.defaultCourier || this.settings.delivery.defaultCourier,
      estimatedTime: dto.estimatedTime || this.settings.delivery.estimatedTime,
      options:
        dto.options && dto.options.length > 0
          ? dto.options.map((o) => ({ ...o, active: o.active ?? true }))
          : this.settings.delivery.options,
    };

    return {
      message: 'Delivery settings updated successfully.',
      data: this.settings.delivery,
    };
  }

  /* ── Update Section Settings ── */
  updateSectionSettings(section: string, data: any) {
    if ((this.settings as any)[section]) {
      (this.settings as any)[section] = {
        ...(this.settings as any)[section],
        ...data,
      };
    } else {
      (this.settings as any)[section] = data;
    }

    return {
      message: `${section} settings updated successfully.`,
      data: (this.settings as any)[section],
    };
  }

  /* ── Update All Settings ── */
  updateAllSettings(payload: any) {
    this.settings = {
      ...this.settings,
      ...payload,
    };
    return {
      message: 'All store settings updated successfully.',
      data: this.settings,
    };
  }
}

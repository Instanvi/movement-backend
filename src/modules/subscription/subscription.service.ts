import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionRepository } from '../../domain/repositories/subscription.repository';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async create(data: CreateSubscriptionDto) {
    return await this.subscriptionRepo.create({
      ...data,
      metadata: data.metadata || {},
    });
  }

  async getById(id: string) {
    const sub = await this.subscriptionRepo.findOne(id);
    if (!sub) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return sub;
  }

  async getByChurchId(churchId: string) {
    return await this.subscriptionRepo.findByChurchId(churchId);
  }

  async getActiveByChurchId(churchId: string) {
    return await this.subscriptionRepo.findActiveByChurchId(churchId);
  }

  async update(id: string, data: UpdateSubscriptionDto) {
    const sub = await this.subscriptionRepo.findOne(id);
    if (!sub) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return await this.subscriptionRepo.update(id, data);
  }

  async updateByStripeId(
    stripeSubscriptionId: string,
    data: Partial<UpdateSubscriptionDto>,
  ) {
    return await this.subscriptionRepo.updateByStripeId(
      stripeSubscriptionId,
      data,
    );
  }

  async delete(id: string) {
    const sub = await this.subscriptionRepo.findOne(id);
    if (!sub) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return await this.subscriptionRepo.delete(id);
  }
}

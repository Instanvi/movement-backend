import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChurchRepository } from '../../domain/repositories/church.repository';
import { BranchRepository } from '../../domain/repositories/branch.repository';
import { MemberRepository } from '../../domain/repositories/member.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { CreateChurchDto } from '../church/dto/church.dto';
import { CreateBranchDto } from '../branch/dto/branch.dto';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly churchRepo: ChurchRepository,
    private readonly branchRepo: BranchRepository,
    private readonly memberRepo: MemberRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async onboard(
    userId: string,
    churchData: CreateChurchDto,
    hqBranchData: CreateBranchDto,
  ) {
    const user = await this.userRepo.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Verify your email before onboarding a new church.',
      );
    }

    const church = await this.churchRepo.create({
      name: churchData.name,
      slug: churchData.slug || churchData.name.toLowerCase().replace(/ /g, '-'),
      logo: churchData.logo,
      denomination: churchData.denomination,
      metadata: churchData.metadata,
    });

    const hqBranch = await this.branchRepo.create({
      name: hqBranchData.name || 'Headquarters',
      address: hqBranchData.address,
      city: hqBranchData.city,
      state: hqBranchData.state,
      country: hqBranchData.country,
      zipCode: hqBranchData.zipCode,
      phoneNumber: hqBranchData.phoneNumber,
      email: hqBranchData.email,
      website: hqBranchData.website,
      churchId: church.id,
    });

    // 1. Church-wide leadership record (Overseer)
    await this.memberRepo.create({
      userId,
      churchId: church.id,
      branchId: null, // Church-wide
      role: 'overseer',
    });

    // 2. Branch-specific leadership record (Admin)
    await this.memberRepo.create({
      userId,
      churchId: church.id,
      branchId: hqBranch.id,
      role: 'admin',
    });

    const branchCount = await this.branchRepo.countByChurchId(church.id);

    return { church, hqBranch, branchCount };
  }
}

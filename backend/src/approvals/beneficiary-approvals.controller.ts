import { Controller, Get, Post, Param, Body, Query, Req } from '@nestjs/common';
import { BeneficiaryApprovalsService } from './beneficiary-approvals.service';
import { Protected } from '../auth/protected.decorator';

@Controller('api/approvals/beneficiaries')
export class BeneficiaryApprovalsController {
  constructor(private readonly approvalsService: BeneficiaryApprovalsService) {}

  /**
   * GET /api/approvals/beneficiaries/pending
   * Get all pending beneficiary approvals with pagination
   */
  @Get('pending')
  @Protected()
  async getPendingApprovals(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, parseInt(limit) || 10);
    const result = await this.approvalsService.getPendingApprovals(pageNum, limitNum);
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * POST /api/approvals/beneficiaries/:id/approve
   * Approve a beneficiary application
   */
  @Post(':id/approve')
  @Protected()
  async approveBeneficiary(
    @Param('id') beneficiaryId: string,
    @Body() body: { adminId: string },
    @Req() req: any,
  ) {
    // Get admin email from JWT token context
    const adminEmail = req.user?.email || 'admin@hopecard.com';
    const result = await this.approvalsService.approveBeneficiary(
      beneficiaryId,
      body.adminId,
      adminEmail,
    );
    return result;
  }

  /**
   * POST /api/approvals/beneficiaries/:id/reject
   * Reject a beneficiary application
   */
  @Post(':id/reject')
  @Protected()
  async rejectBeneficiary(
    @Param('id') beneficiaryId: string,
    @Body() body: { adminId: string; reason?: string },
    @Req() req: any,
  ) {
    // Get admin email from JWT token context
    const adminEmail = req.user?.email || 'admin@hopecard.com';
    const result = await this.approvalsService.rejectBeneficiary(
      beneficiaryId,
      body.adminId,
      body.reason,
      adminEmail,
    );
    return result;
  }

  /**
   * GET /api/approvals/beneficiaries/:id/history
   * Get approval history for a beneficiary
   */
  @Get(':id/history')
  @Protected()
  async getApprovalHistory(@Param('id') beneficiaryId: string) {
    const history = await this.approvalsService.getApprovalHistory(beneficiaryId);
    return {
      success: true,
      data: history,
    };
  }
}

import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { SubmitInterviewDto } from './dto/submit-interview.dto';
import { InterviewsService } from './interviews.service';
import { INTERVIEW_QUESTIONS } from './constants/questions';
import { Param, NotFoundException } from '@nestjs/common';


@UseGuards(JwtAuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get('questions')
  getQuestions() {
    return INTERVIEW_QUESTIONS;
  }

  @Post()
  submit(@Req() req: any, @Body() dto: SubmitInterviewDto) {
    return this.interviewsService.submitInterview(
      req.user.userId,
      dto.answers,
    );
  }

  @Get()
  history(@Req() req: any) {
    return this.interviewsService.getHistory(req.user.userId);
  }

  @Get(':id')
    async detail(@Req() req: any, @Param('id') id: string) {
        const result = await this.interviewsService.getInterviewDetail(
            req.user.userId,
            id,
        );

        if (!result) {
            throw new NotFoundException('Interview not found');
        }

        return result;
    }
}
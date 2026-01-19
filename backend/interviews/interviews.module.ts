import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { AiAnalysisService } from '../ai/ai-analysis.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService, AiAnalysisService],
})
export class InterviewsModule {}
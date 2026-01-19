import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interview, InterviewDocument } from './schemas/interview.schema';
import { Feedback, FeedbackDocument } from './schemas/feedback.schema';
import { INTERVIEW_QUESTIONS } from './constants/questions';
import { AiAnalysisService } from '../ai/ai-analysis.service';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectModel(Interview.name)
    private interviewModel: Model<InterviewDocument>,
    @InjectModel(Feedback.name)
    private feedbackModel: Model<FeedbackDocument>,
    private aiService: AiAnalysisService,
  ) {}

  private readonly logger = new Logger(InterviewsService.name);

  async submitInterview(
    userId: string,
    answers: { questionId: string; response: string }[],
  ) {
    if (answers.length !== INTERVIEW_QUESTIONS.length) {
      throw new BadRequestException('All questions must be answered');
    }

    const questionIds = INTERVIEW_QUESTIONS.map((q) => q.id);

    for (const a of answers) {
      if (!questionIds.includes(a.questionId)) {
        throw new BadRequestException('Invalid question ID');
      }
    }

    const interview = await this.interviewModel.create({
      userId: new Types.ObjectId(userId),
      questions: INTERVIEW_QUESTIONS,
      answers,
    });

    this.logger.log(`Interview created id=${interview._id.toString()} for userId=${userId}`);

    const analysis = await this.aiService.analyze(answers);

    this.logger.log(`Analysis complete for interviewId=${interview._id.toString()}: ${JSON.stringify(analysis.scores)}`);

    const feedback = await this.feedbackModel.create({
      interviewId: interview._id,
      userId: interview.userId,
      scores: analysis.scores,
      explanations: analysis.explanations,
    });

    this.logger.log(`Feedback created id=${feedback._id.toString()} for interviewId=${interview._id.toString()}`);

    return {
      interviewId: interview._id.toString(),
      feedback: {
        scores: analysis.scores,
        explanations: analysis.explanations,
    },
    };
  }

  async getHistory(userId: string) {
   const feedbacks = await this.feedbackModel
    .find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return feedbacks.map((f) => ({
    interviewId: f.interviewId.toString(),
    createdAt: f.createdAt,
    scores: f.scores,
  }));
    }


    async getInterviewDetail(userId: string, interviewId: string) {
        const interviewObjectId = new Types.ObjectId(interviewId);
        const userObjectId = new Types.ObjectId(userId);

        const interview = await this.interviewModel
        .findOne({ _id: interviewObjectId, userId: userObjectId })
        .lean()
        .exec();

         if (!interview) {
            this.logger.log(`getInterviewDetail: interview not found interviewId=${interviewId} for userId=${userId}`);
             return null;
         }

        const feedback = await this.feedbackModel
            .findOne({ interviewId: interviewObjectId, userId: userObjectId })
            .lean()
            .exec();

        return {
            interviewId: interview._id.toString(),
            questions: interview.questions,
            answers: interview.answers,
            feedback: feedback
            ? {
                scores: feedback.scores,
                explanations: feedback.explanations,
                createdAt: feedback.createdAt,
                }
            : null,
        };
    }
}
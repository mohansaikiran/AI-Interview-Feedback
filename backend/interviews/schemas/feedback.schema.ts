import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FeedbackDocument = HydratedDocument<Feedback>;

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: Types.ObjectId, required: true })
  interviewId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({
    _id: false,
    type: {
      communication: Number,
      problemSolving: Number,
      empathy: Number,
    },
    required: true,
  })
  scores: {
    communication: number;
    problemSolving: number;
    empathy: number;
  };

  @Prop({
    _id: false,
    type: {
      communication: String,
      problemSolving: String,
      empathy: String,
    },
    required: true,
  })
  explanations: {
    communication: string;
    problemSolving: string;
    empathy: string; 
  };

  createdAt: Date;
  updatedAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
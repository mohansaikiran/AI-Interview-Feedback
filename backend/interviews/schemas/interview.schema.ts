import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InterviewDocument = HydratedDocument<Interview>;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({
    _id: false,
    type: [
      {
        id: String,
        text: String,
      },
    ],
    required: true,
  })
  questions: { id: string; text: string }[];

  @Prop({
    _id: false,
    type: [
      {
        questionId: String,
        response: String,
      },
    ],
    required: true,
  })
  answers: { questionId: string; response: string }[];

  @Prop({ default: 'COMPLETED' })
  status: string;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
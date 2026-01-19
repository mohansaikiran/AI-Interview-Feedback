import { IsArray, IsString, MinLength } from 'class-validator';

export class InterviewAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  @MinLength(10)
  response: string;
}

export class SubmitInterviewDto {
  @IsArray()
  answers: InterviewAnswerDto[];
}
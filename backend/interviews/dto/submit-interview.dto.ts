import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, MinLength, ValidateNested } from 'class-validator';


export class InterviewAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  @MinLength(10)
  response: string;
}

export class SubmitInterviewDto {
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => InterviewAnswerDto)
  answers: InterviewAnswerDto[];
}
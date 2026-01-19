/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './client';

export type Question = {
  id: string;
  text: string;
};

export type Answer = {
  questionId: string;
  response: string;
};

export type SubmitInterviewResponse = {
  interviewId: string;
  feedback: {
    scores: {
      communication: number;
      problemSolving: number;
      empathy: number;
    };
    explanations: {
      communication: string;
      problemSolving: string;
      empathy: string;
    };
  };
};

export type InterviewSummary = {
  interviewId: string;
  createdAt: string;
  scores: {
    communication: number;
    problemSolving: number;
    empathy: number;
  };
};

export type InterviewDetail = {
  interviewId: string;
  createdAt: string;
  questions: {
    id: string;
    text: string;
  }[];
  answers: {
    questionId: string;
    response: string;
  }[];
  feedback: {
    scores: {
      communication: number;
      problemSolving: number;
      empathy: number;
    };
    explanations: {
      communication: string;
      problemSolving: string;
      empathy: string;
    };
    createdAt: string;
  };
};

export async function hasInterviewHistory(): Promise<boolean> {
  const res = await api.get<any[]>('/interviews');
  return Array.isArray(res.data) && res.data.length > 0;
}

export async function getInterviewHistory() {
  const res = await api.get<InterviewSummary[]>('/interviews');
  return res.data;
}

export async function getInterviewDetail(id: string) {
  const res = await api.get<InterviewDetail>(`/interviews/${id}`);
  return res.data;
}

export async function getQuestions() {
  const res = await api.get<Question[]>('/interviews/questions');
  return res.data;
}

export async function submitInterview(answers: Answer[]) {
  const res = await api.post<SubmitInterviewResponse>('/interviews', {
    answers,
  });
  return res.data;
}
import { Injectable, Logger } from '@nestjs/common';

type Answer = { questionId: string; response: string };

type AnalysisResult = {
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

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);

  async analyze(answers: Answer[]): Promise<AnalysisResult> {
    this.logger.log(`Starting analysis for ${answers.length} answers`);
    const provider = (process.env.ANALYSIS_PROVIDER || 'mock').toLowerCase();

    this.logger.log(`Provider val is ${provider}`);
    if (provider === 'openai') {
      this.logger.log('Using OpenAI provider for analysis');
      return this.analyzeWithOpenAI(answers);
    }

    this.logger.log('Using mock provider for analysis');
    return this.analyzeMock(answers);
  }

  private analyzeMock(answers: Answer[]): AnalysisResult {
    const avgLength =
      answers.reduce((sum, a) => sum + a.response.trim().length, 0) /
      Math.max(answers.length, 1);

    return {
      scores: {
        communication: clamp(avgLength * 0.6),
        problemSolving: clamp(avgLength * 0.9),
        empathy: clamp(avgLength * 0.7),
      },
      explanations: {
        communication:
          'Your responses were clear and structured, showing good communication.',
        problemSolving:
          'You demonstrated a logical approach to tackling problems.',
        empathy:
          'Your answers showed awareness of others’ perspectives and emotions.',
      },
    };
  }

  private async analyzeWithOpenAI(answers: Answer[]): Promise<AnalysisResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set. Falling back to mock.');
      return this.analyzeMock(answers);
    }

    this.logger.log(`analyzeWithOpenAI: model=${model}, answers=${answers.length}`);

    const system = `
      You are an interview feedback evaluator. The questions for the interview mapped from q1 to q5 are as below:
      q1: You discover a potential security vulnerability in a microservice. Walk me through your process for investigating, documenting, and addressing this issue?
      q2: Describe a situation where you had to quickly learn and implement a new technology stack or framework that was critical for a project. How did you approach the learning process?
      q3: Tell me about a time when you implemented a new AI feature that required architectural changes. How did you ensure the changes maintained system reliability?
      q4: Tell me about a time when you collaborated with a machine learning team to implement AI features. How did you ensure effective communication and integration?
      q5: Imagine you've been assigned to refactor a critical service that has significant technical debt. How would you approach this challenge while maintaining zero downtime?

      Return ONLY valid JSON matching this exact schema:
      {
        "scores": { "communication": int(0-100), "problemSolving": int(0-100), "empathy": int(0-100) },
        "explanations": {
          "communication": "1-2 simple sentences for the candidate",
          "problemSolving": "1-2 simple sentences for the candidate",
          "empathy": "1-2 simple sentences for the candidate"
        }
      }

      Rules:
      - integers only for scores
      - be constructive and clear
      - explanations must relate to answers
      - be kind while providing feedback
      - no extra keys
      `.trim();

    const payload = {
      answers: answers.map((a) => ({
        questionId: a.questionId,
        response: a.response,
      })),
    };

    const requestBody: any = {
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      response_format: { type: 'json_object' },
    };

    if (process.env.OPENAI_TEMPERATURE !== undefined) {
      const t = Number(process.env.OPENAI_TEMPERATURE);
      if (!Number.isNaN(t)) requestBody.temperature = t;
    }

    this.logger.log('Sending request to OpenAI API');
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    this.logger.log(`OpenAI response status: ${res.status}`);
    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`OpenAI error ${res.status}: ${text}`);
      return this.analyzeMock(answers);
    }

    const data: any = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    this.logger.log(`OpenAI raw content length: ${String(content ?? '').length}`);
    if (!content) {
      this.logger.error('OpenAI returned empty content. Falling back to mock.');
      return this.analyzeMock(answers);
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
      this.logger.log(`OpenAI parsed JSON keys: ${Object.keys(parsed || {}).join(',')}`);
    } catch {
      this.logger.error('OpenAI returned invalid JSON. Falling back to mock.');
      return this.analyzeMock(answers);
    }

    return {
      scores: {
        communication: clamp(parsed?.scores?.communication),
        problemSolving: clamp(parsed?.scores?.problemSolving),
        empathy: clamp(parsed?.scores?.empathy),
      },
      explanations: {
        communication: String(parsed?.explanations?.communication ?? ''),
        problemSolving: String(parsed?.explanations?.problemSolving ?? ''),
        empathy: String(parsed?.explanations?.empathy ?? ''),
      },
    };
  }
}
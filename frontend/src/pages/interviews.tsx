import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Spinner,
  Stack,
  Text,
  Textarea,
  useToast,
  Progress,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  getQuestions,
  submitInterview,
  type Question,
  type Answer,
} from '../api/interviews.api';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/ui/card';
import { PageHeader } from '../components/ui/pageHeader';
import { ChatBubble } from '../components/ui/chatBubble';

export function InterviewPage() {
  const nav = useNavigate();
  const toast = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep answers as a map-like array and update in place
  const [answers, setAnswers] = useState<Answer[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasCompletedInterview } = useAuth();

  const MIN_ANSWER_LEN = 20;
  const currentQuestion = questions[currentIndex];

  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return '';
    return answers.find((a) => a.questionId === currentQuestion.id)?.response ?? '';
  }, [answers, currentQuestion]);

  const canProceed = currentAnswer.trim().length >= MIN_ANSWER_LEN;

  useEffect(() => {
    // one-time interview rule
    if (hasCompletedInterview === true) {
      nav('/home');
      return;
    }

    async function load() {
      try {
        const qs = await getQuestions();
        setQuestions(qs);
      } catch {
        toast({ title: 'Failed to load questions', status: 'error' });
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [toast, hasCompletedInterview, nav]);

  function upsertAnswer(questionId: string, response: string) {
    setAnswers((prev) => {
      const exists = prev.some((x) => x.questionId === questionId);
      if (exists) {
        return prev.map((x) => (x.questionId === questionId ? { ...x, response } : x));
      }
      return [...prev, { questionId, response }];
    });
  }

  async function handleNextOrSubmit() {
    if (!currentQuestion) return;

    if (!canProceed) {
      toast({
        title: `Please enter at least ${MIN_ANSWER_LEN} characters`,
        status: 'warning',
      });
      return;
    }

    const isLast = currentIndex === questions.length - 1;

    if (!isLast) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    // Submit on last question
    try {
      setIsSubmitting(true);

      // Ensure answers are in the same order as questions (nice for backend + consistency)
      const orderedAnswers: Answer[] = questions.map((q) => ({
        questionId: q.id,
        response: answers.find((a) => a.questionId === q.id)?.response ?? '',
      }));

      const res = await submitInterview(orderedAnswers);

      nav(`/feedback/${res.interviewId}`, {
        state: res.feedback,
      });
    } catch {
      toast({ title: 'Submission failed', status: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (!questions.length) {
    return (
      <Card>
        <Text color="gray.600">No questions available.</Text>
      </Card>
    );
  }

  return (
    <Stack spacing={8}>
      <PageHeader
        title="Interview"
        subtitle="Answer thoughtfully. You can take this interview only once."
      />

      <Card>
        <Stack spacing={3}>
          <Text fontSize="sm" color="gray.600">
            Question {currentIndex + 1} of {questions.length}
          </Text>

          <Progress value={((currentIndex + 1) / questions.length) * 100} />

          <Stack spacing={3} pt={2}>
            {/* previous Q&A */}
            {questions.slice(0, currentIndex).map((q, idx) => {
              const a = answers.find((x) => x.questionId === q.id)?.response ?? '';
              return (
                <Stack key={q.id} spacing={2}>
                  <ChatBubble variant="question">
                    <Text fontWeight="medium">Q{idx + 1}</Text>
                    <Text>{q.text}</Text>
                  </ChatBubble>

                  <ChatBubble variant="answer">
                    <Text color="gray.700">{a}</Text>
                  </ChatBubble>
                </Stack>
              );
            })}

            {/* current question */}
            {currentQuestion && (
              <Stack spacing={3}>
                <ChatBubble variant="question">
                  <Text fontWeight="medium">Q{currentIndex + 1}</Text>
                  <Text>{currentQuestion.text}</Text>
                </ChatBubble>

                <Box>
                  <Textarea
                    data-testid="answer"
                    placeholder="Type your answer..."
                    value={currentAnswer}
                    onChange={(e) => upsertAnswer(currentQuestion.id, e.target.value)}
                    minH="140px"
                  />

                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Minimum {MIN_ANSWER_LEN} characters.
                  </Text>
                </Box>

                <HStack justify="flex-end">
                  <Button
                    data-testid="next-submit"
                    colorScheme="blue"
                    onClick={handleNextOrSubmit}
                    isDisabled={!canProceed}
                    isLoading={isSubmitting}
                  >
                    {currentIndex < questions.length - 1 ? 'Next' : 'Submit'}
                  </Button>
                </HStack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
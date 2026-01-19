/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  HStack,
  Progress,
  Stack,
  Text,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { Card } from '../components/ui/card';
import { PageHeader } from '../components/ui/pageHeader';
import { getInterviewDetail } from '../api/interviews.api';

type FeedbackShape = {
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
  createdAt?: string;
};

export function FeedbackPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackShape | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Prefer router state if available
        const stateFeedback = location.state as any;
        if (stateFeedback?.scores && stateFeedback?.explanations) {
          setFeedback(stateFeedback);
          setLoading(false);
          return;
        }

        // Fallback to API fetch (refresh-safe)
        if (!id) {
          setFeedback(null);
          setLoading(false);
          return;
        }

        const detail = await getInterviewDetail(id);
        setFeedback(detail.feedback);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, location.state]);

  if (loading) return <Spinner />;

  if (!feedback) {
    return (
      <Stack spacing={6}>
        <PageHeader title="Feedback" subtitle="We couldn’t find this interview." />
        <Button alignSelf="flex-start" onClick={() => nav('/history')}>
          Go to history
        </Button>
      </Stack>
    );
  }

  const skills: Array<{
    key: keyof FeedbackShape['scores'];
    label: string;
  }> = [
    { key: 'communication', label: 'Communication' },
    { key: 'problemSolving', label: 'Problem Solving' },
    { key: 'empathy', label: 'Empathy' },
  ];

  return (
    <Box data-testid="feedback-page">
    <Stack spacing={8}>
      <PageHeader
        title="Your feedback"
        subtitle="Here’s how your responses came across based on the interview."
        right={
          <>
            <Button variant="ghost" onClick={() => nav('/home')}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => nav('/history')}>
              History
            </Button>
            {id && (
              <Button colorScheme="blue" onClick={() => nav(`/history/${id}`)}>
                View details
              </Button>
            )}
          </>
        }
      />

      <Stack spacing={4}>
        {skills.map((s) => {
          const score = feedback.scores[s.key];
          const explanation = feedback.explanations[s.key];

          return (
            <Card key={s.key}>
              <Stack spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">{s.label}</Text>
                  <Text fontWeight="semibold">{score}/100</Text>
                </HStack>

                <Progress value={score} />

                <Text color="gray.600">{explanation}</Text>
              </Stack>
            </Card>
          );
        })}
      </Stack>

      <Card>
        <Stack spacing={2}>
          <Text fontWeight="semibold">What happens next</Text>
          <Text color="gray.600">
            You can review your full Q&A and feedback breakdown in the interview details page.
          </Text>
          {id && (
            <Button alignSelf="flex-start" onClick={() => nav(`/history/${id}`)}>
              Review interview
            </Button>
          )}
        </Stack>
      </Card>
    </Stack>
  </Box>
  );
}
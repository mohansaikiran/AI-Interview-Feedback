import { useEffect, useState } from 'react';
import {
  Button,
  Stack,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  getInterviewHistory,
  type InterviewSummary,
} from '../api/interviews.api';
import { Card } from '../components/ui/card';
import { PageHeader } from '../components/ui/pageHeader';

export function HomePage() {
  const nav = useNavigate();
  const [history, setHistory] = useState<InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInterviewHistory();
        setHistory(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  const hasInterview = history.length > 0;
  const latest = history[0];

  return (
    <Stack spacing={8}>
  <PageHeader
    title="Welcome"
    subtitle="Your interview feedback is available here once you complete the assessment."
  />

     {!hasInterview && (
      <Card>
        <Stack spacing={4}>
          <Text>
            You haven’t completed the interview yet. This is a one-time assessment designed to
            evaluate communication, problem solving, and empathy.
          </Text>

          <Button data-testid="start-interview" colorScheme="blue" alignSelf="flex-start" onClick={() => nav('/interview')}>
            Start interview
          </Button>
        </Stack>
      </Card>
    )}

      {hasInterview && (
        <Card borderWidth="1px" rounded="md" p={6}>
          <Stack spacing={4}>
            <Text fontWeight="medium">
              You’ve completed the interview.
            </Text>

            <Text color="gray.600">
              Completed on:{' '}
              {new Date(latest.createdAt).toLocaleString()}
            </Text>

            <Text>
              Communication: {latest.scores.communication} ·
              Problem Solving: {latest.scores.problemSolving} ·
              Empathy: {latest.scores.empathy}
            </Text>

            <Text color="gray.600">
              You can review your feedback and responses below.
            </Text>

            <Button
              alignSelf="flex-start"
              onClick={() =>
                nav(`/history/${latest.interviewId}`)
              }
            >
              View interview details
            </Button>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
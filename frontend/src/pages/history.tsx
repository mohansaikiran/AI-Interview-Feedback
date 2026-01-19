import { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Text,
  Spinner,
  Button,
  Card,
  HStack,
  Box,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getInterviewHistory, type InterviewSummary } from '../api/interviews.api';
import { PageHeader } from '../components/ui/pageHeader';
import { ScoreBadge } from '../components/ui/score';

export function HistoryPage() {
  const nav = useNavigate();
  const [items, setItems] = useState<InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInterviewHistory();
        setItems(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Container py={10}>
        <Spinner />
      </Container>
    );
  }

  return (
    <Box data-testid="history-page">
    <Stack spacing={8}>
      <PageHeader
        title="History"
        subtitle="Review your previous interview submission."
      />

      {items.length === 0 ? (
        <Card>
          <Box p={6}>
            <Stack spacing={3}>
              <Text color="gray.600">No interviews yet.</Text>
              <Button alignSelf="flex-start" onClick={() => nav('/home')}>
                Go to home
              </Button>
            </Stack>
          </Box>
        </Card>
      ) : (
        <Stack spacing={5}>
          {items.map((it) => (
            <Card key={it.interviewId}>
              <Box p={2}>
                <Stack spacing={5}>
                  <HStack justify="space-between" align="start">
                    <Stack spacing={1}>
                      <Text fontWeight="semibold">Interview</Text>
                      <Text fontSize="sm" color="gray.600">
                        Completed on: {new Date(it.createdAt).toLocaleString()}
                      </Text>
                    </Stack>

                    <Button size="sm" onClick={() => nav(`/history/${it.interviewId}`)}>
                      View details
                    </Button>
                  </HStack>

                  <HStack spacing={2} flexWrap="wrap">
                    <ScoreBadge label="Communication" score={it.scores.communication} />
                    <ScoreBadge label="Problem Solving" score={it.scores.problemSolving} />
                    <ScoreBadge label="Empathy" score={it.scores.empathy} />
                  </HStack>
                </Stack>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  </Box>
  );
}
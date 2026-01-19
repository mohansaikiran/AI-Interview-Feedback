import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Stack,
  Text,
  Spinner,
  Divider,
  Progress,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import {
  getInterviewDetail,
  type InterviewDetail,
} from '../api/interviews.api';

export function InterviewDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<InterviewDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const res = await getInterviewDetail(id);
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <Container py={10}>
        <Spinner />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container py={10}>
        <Text>Interview not found.</Text>
      </Container>
    );
  }

  return (
    <Container maxW="lg" py={10}>
      <Stack spacing={6}>
        <Heading size="lg">Interview Review</Heading>

        {/* <Text color="gray.600">
          {new Date(data.createdAt).toLocaleString()}
        </Text> */}

        <Divider />

        <Heading size="md">Questions & Answers</Heading>

        {data.questions.map((q, idx) => {
          const answer = data.answers.find(
            (a) => a.questionId === q.id,
          );

          return (
            <Box key={q.id} borderWidth="1px" rounded="md" p={4}>
              <Stack spacing={2}>
                <Text fontWeight="medium">
                  Q{idx + 1}. {q.text}
                </Text>
                <Text color="gray.700">
                  {answer?.response}
                </Text>
              </Stack>
            </Box>
          );
        })}

        <Divider />

        <Heading size="md">Feedback</Heading>

        {(['communication', 'problemSolving', 'empathy'] as const).map(
          (key) => (
            <Box key={key}>
              <Text fontWeight="medium" mb={1}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <Progress value={data.feedback.scores[key]} mb={2} />
              <Text color="gray.600">
                {data.feedback.explanations[key]}
              </Text>
            </Box>
          ),
        )}
      </Stack>
    </Container>
  );
}
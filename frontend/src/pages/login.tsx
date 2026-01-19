import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);

      nav('/home');
    } catch (err) {
        const error = err as {
    response?: { data?: { message?: string | string[] } }; }
      const message =
        error?.response?.data?.message?.[0] ??
        error?.response?.data?.message ??
        'Something went wrong';
      toast({
        title: 'Authentication failed',
        description: String(message),
        status: 'error',
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Container maxW="md" py={12}>
      <Stack spacing={6}>
        <Heading size="lg">Candidate Interview</Heading>
        <Text color="gray.600">
          {mode === 'login'
            ? 'Log in to continue your interview.'
            : 'Create an account to start your interview.'}
        </Text>

        <Box as="form" onSubmit={onSubmit} borderWidth="1px" rounded="lg" p={6}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                data-testid="email"
                value={email}
                placeholder='Enter your email'
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                data-testid="password"
                value={password}
                placeholder='Enter password'
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </FormControl>

            <Button type="submit" isLoading={isSubmitting} data-testid={mode === 'login'? 'login-submit' : 'register-submit'}>
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Button>

            <Button
              data-testid={mode === 'login'? 'login' : 'register'}
              variant="ghost"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Log in'}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
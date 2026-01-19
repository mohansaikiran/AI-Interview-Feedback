import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../auth/AuthContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, hasCompletedInterview } = useAuth();
  const nav = useNavigate();

  return (
    <Box minH="100vh" bg="gray.50">
      <Box
      borderBottomWidth="1px"
      bg="white"
      position="sticky"
      top={0}
      zIndex={10}
      shadow="sm"
    >
      <Container maxW="container.xl" py={3}>
        <Flex align="center">
          {/* LEFT: Brand */}
          <Text fontWeight="bold" fontSize="lg">
            Candidate Interview
          </Text>

          {/* CENTER: Navigation */}
          <HStack spacing={5} ml={6} fontWeight="medium" color="gray.700">
            <Link as={RouterLink} to="/home">
              Home
            </Link>

            {hasCompletedInterview === false && (
              <Link as={RouterLink} to="/interview">
                Take interview
              </Link>
            )}

            <Link as={RouterLink} to="/history">
              History
            </Link>
          </HStack>

          {/* PUSH RIGHT */}
          <Spacer />

          {/* RIGHT: User actions */}
          <HStack spacing={3}>
            <Box
              px={3}
              py={1}
              bg="gray.100"
              rounded="full"
              fontSize="sm"
              color="gray.700"
            >
              {user?.email}
            </Box>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logout();
                nav('/login');
              }}
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>

  <Container maxW="lg" py={10}>
    {children}
  </Container>
</Box>
  );
}
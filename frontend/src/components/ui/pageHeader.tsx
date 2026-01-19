import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import React from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: '1fr', md: '1fr auto' }}
      gap={6}
      alignItems="start"   // 👈 KEY CHANGE
    >
      {/* Left */}
      <Stack spacing={3}>
        <Heading size="lg">{title}</Heading>
        {subtitle && (
          <Text color="gray.600" maxW="520px">
            {subtitle}
          </Text>
        )}
      </Stack>

      {/* Right
      {right && (
        <HStack spacing={3} justifySelf="end">
          {right}
        </HStack>
      )} */}
    </Box>
  );
}
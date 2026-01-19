import { Box, type BoxProps } from '@chakra-ui/react';

export function ChatBubble({
  variant,
  children,
  ...props
}: BoxProps & { variant: 'question' | 'answer' }) {
  const isAnswer = variant === 'answer';

  return (
    <Box
      maxW="85%"
      alignSelf={isAnswer ? 'flex-end' : 'flex-start'}
      bg={isAnswer ? 'blue.50' : 'white'}
      borderWidth="1px"
      borderColor={isAnswer ? 'blue.100' : 'gray.200'}
      rounded="xl"
      px={4}
      py={3}
      shadow="sm"
      {...props}
    >
      {children}
    </Box>
  );
}
import { Box, type BoxProps } from '@chakra-ui/react';

export function Card(props: BoxProps) {
  return (
    <Box
      borderWidth="1px"
      rounded="lg"
      bg="white"
      shadow="sm"
      p={6}
      {...props}
    />
  );
}
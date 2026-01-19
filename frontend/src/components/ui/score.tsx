import { Badge, type BadgeProps } from '@chakra-ui/react';

export function ScoreBadge({
  label,
  score,
  ...props
}: BadgeProps & { label: string; score: number }) {
  return (
    <Badge
      rounded="full"
      px={3}
      py={1}
      variant="subtle"
      colorScheme={score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red'}
      {...props}
    >
      {label}: {score}
    </Badge>
  );
}
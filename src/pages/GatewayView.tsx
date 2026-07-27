import { useParams } from 'react-router-dom';
import { Text } from '@capra/core';

export default function GatewayView() {
  const { id } = useParams<{ id: string }>();
  return <Text as="h1" variant="heading-lg">Gateway: {id}</Text>;
}
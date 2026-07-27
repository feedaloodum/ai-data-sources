import { useParams } from 'react-router-dom';
import { Text } from '@capra/core';

export default function ProviderView() {
  const { id } = useParams<{ id: string }>();
  return <Text as="h1" variant="heading-lg">Provider: {id}</Text>;
}
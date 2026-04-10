import React from 'react';
import { EmptyState, EmptyStateVariant, Title, EmptyStateBody } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

export const StateError: React.FC = () => (
  <EmptyState variant={EmptyStateVariant.sm} icon={ExclamationCircleIcon}>
    <EmptyStateBody>
      <Title headingLevel="h2" size="lg">
        Unable to connect
      </Title>
    </EmptyStateBody>
    <EmptyStateBody>There was an error retrieving data. Check your connection and try again.</EmptyStateBody>
  </EmptyState>
);

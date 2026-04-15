import React from 'react';
import { EmptyState, EmptyStateVariant, EmptyStateBody } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';

export const StateError: React.FC = () => (
  <EmptyState variant={EmptyStateVariant.sm} icon={ExclamationCircleIcon} headingLevel="h2" titleText="Unable to connect">
    <EmptyStateBody>There was an error retrieving data. Check your connection and try again.</EmptyStateBody>
  </EmptyState>
);

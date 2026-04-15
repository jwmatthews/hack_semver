import React from 'react';
import { EmptyState, EmptyStateBody, EmptyStateVariant } from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';

export interface NoDataEmptyStateProps {
  title: string;
  description?: string;
}

export const NoDataEmptyState: React.FC<NoDataEmptyStateProps> = ({ title, description }) => (
  <EmptyState variant={EmptyStateVariant.sm} icon={CubesIcon} titleText={title} headingLevel="h2">
    {description && <EmptyStateBody>{description}</EmptyStateBody>}
  </EmptyState>
);

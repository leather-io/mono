import { Component, type ReactNode } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import { ScreenPlaceholder } from './screen-placeholder';

interface BoundaryProps {
  label: string;
  children: ReactNode;
}

interface BoundaryState {
  error: Error | null;
}

export class ScreenBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error(`[exploration] ${this.props.label} crashed:`, error);
  }

  override render() {
    if (this.state.error)
      return (
        <ScreenPlaceholder title={`${this.props.label} crashed`} note={this.state.error.message} />
      );
    return this.props.children;
  }
}

export class CanvasBoundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error(`[exploration] ${this.props.label}: the canvas crashed:`, error);
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <Box p="space.07">
        <Stack
          gap="space.02"
          maxWidth="720px"
          p="space.05"
          borderWidth={1}
          borderStyle="solid"
          borderColor="ink.border-default"
          borderRadius="sm"
          bg="ink.background-primary"
        >
          <styled.span textStyle="label.01" color="ink.text-primary">
            {`${this.props.label}: the canvas crashed`}
          </styled.span>
          <styled.code textStyle="caption.01" color="ink.text-secondary" whiteSpace="pre-wrap">
            {error.message}
          </styled.code>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Check the config and the variant module for this view, then the browser console.
          </styled.span>
        </Stack>
      </Box>
    );
  }
}

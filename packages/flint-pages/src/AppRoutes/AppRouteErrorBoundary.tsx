import React, { ComponentType } from "react";

export interface AppRouteContainerProps {
  Comp: ComponentType<any>;
  title: string;
}

export interface AppRouteErrorBoundaryState {
  hasError: boolean;
}

export class AppRouteErrorBoundary extends React.PureComponent<
  AppRouteContainerProps,
  AppRouteErrorBoundaryState
> {
  public constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): Partial<AppRouteErrorBoundaryState> {
    return { hasError: true };
  }

  public componentDidCatch(error: any, errorInfo: any): void {
    console.error(error, errorInfo);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <h1>加载错误...</h1>;
    }

    const { Comp } = this.props;
    return React.createElement(Comp);
  }
}

// This file was generated.

export namespace RNGestureHandlerModule {
  export const NAME = 'RNGestureHandlerModule' as const

  export interface Spec {
    handleSetJSResponder(tag: number, blockNativeResponder: boolean): void;

    handleClearJSResponder(): void;

    createGestureHandler(handlerName: string, handlerTag: number, config: Object): void;

    attachGestureHandler(handlerTag: number, newView: number, actionType: number): void;

    updateGestureHandler(handlerTag: number, newConfig: Object): void;

    dropGestureHandler(handlerTag: number): void;

    install(): boolean;

    flushOperations(): void;

  }
}

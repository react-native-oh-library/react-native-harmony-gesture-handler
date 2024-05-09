import {Tag} from '@rnoh/react-native-openharmony/ts';
import {GestureHandlerArkUIAdapter} from './GestureHandlerArkUIAdapter';
import {ViewRegistry} from './ViewRegistry';
import {RNGHLogger, GestureHandlerRegistry} from '../core';
import {TouchEvent, TouchType} from './types';

export class RNGHRootTouchHandlerArkTS {
  private adapterByViewTag: Map<number, GestureHandlerArkUIAdapter> = new Map(); // TODO: remove adapter when view is removed
  /**
   * A view is ACTIVE in a window defined by two POINTER_DOWN events
   */
  private activeViewTags = new Set<number>();
  private viewRegistry: ViewRegistry;
  private gestureHandlerRegistry: GestureHandlerRegistry;
  private logger: RNGHLogger;
  private rootTag: Tag;

  constructor(
    rootTag: Tag,
    viewRegistry: ViewRegistry,
    gestureHandlerRegistry: GestureHandlerRegistry,
    logger: RNGHLogger,
  ) {
    this.rootTag = rootTag;
    this.viewRegistry = viewRegistry;
    this.gestureHandlerRegistry = gestureHandlerRegistry;
    this.logger = logger;
  }

  public handleTouch(touchEvent: any) {
    const e = touchEvent as TouchEvent;
    if (e.type === TouchType.Down) {
      this.activeViewTags.clear();
    }
    for (const changedTouch of e.changedTouches) {
      const views = this.viewRegistry.getTouchableViewsAt(
        {
          x: changedTouch.windowX,
          y: changedTouch.windowY,
        },
        this.rootTag,
      );
      for (const view of views) {
        for (const handler of this.gestureHandlerRegistry.getGestureHandlersByViewTag(
          view.getTag(),
        )) {
          this.logger.info(
            `Found GestureHandler ${handler.getTag()} for view ${view.getTag()}`,
          );

          // create adapter if necessary
          if (!this.adapterByViewTag.has(view.getTag())) {
            this.adapterByViewTag.set(
              view.getTag(),
              new GestureHandlerArkUIAdapter(
                view,
                this.logger,
              ),
            );
          }

          // attach handler (there might be multiple handlers per view)
          this.adapterByViewTag.get(view.getTag())!.attachGestureHandler(handler) // TODO: detachGestureHandler

          // register active view tags
          if (e.type === TouchType.Down) {
            this.activeViewTags.add(view.getTag());
          }
        }
      }

      // send touch to gesture handlers
      for (const viewTag of this.activeViewTags) {
        const adapter = this.adapterByViewTag.get(viewTag);
        if (adapter) {
          adapter.handleTouch(e);
        }
      }
    }
  }
}

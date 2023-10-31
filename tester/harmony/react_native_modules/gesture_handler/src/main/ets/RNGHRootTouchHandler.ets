import {  ComponentManagerRegistry, Tag, TouchTargetHelper, RNViewManager } from "rnoh"
import { GestureHandlerRegistry } from "./GestureHandlerRegistry"
import { GestureHandlerArkUIAdapter } from "./GestureHandlerArkUIAdapter"
import { ViewRegistry } from "./ViewRegistry"
import { RNGHLogger } from './RNGHLogger'

export class RNGHRootTouchHandler {
  private adapterByViewTag: Map<number, GestureHandlerArkUIAdapter> = new Map() // TODO: remove an adapter when a view or gesture handler is removed
  private activeViewTags: number[] = []
  private viewRegistry: ViewRegistry
  private gestureHandlerRegistry: GestureHandlerRegistry
  private touchTargetHelper: TouchTargetHelper
  private componentManagerRegistry: ComponentManagerRegistry
  private logger: RNGHLogger
  private rootTag: Tag

  constructor(rootTag: Tag,
              viewRegistry: ViewRegistry,
              gestureHandlerRegistry: GestureHandlerRegistry,
              touchTargetHelper: TouchTargetHelper,
              componentManagerRegistry: ComponentManagerRegistry,
              logger: RNGHLogger) {
    this.rootTag = rootTag
    this.viewRegistry = viewRegistry
    this.gestureHandlerRegistry = gestureHandlerRegistry
    this.touchTargetHelper = touchTargetHelper
    this.componentManagerRegistry = componentManagerRegistry
    this.logger = logger
  }

  public handleTouch(e: TouchEvent) {
    if (e.type === TouchType.Down) {
      this.activeViewTags = []
    }
    for (const changedTouch of e.changedTouches) {
      const targetTag = this.touchTargetHelper.findTouchTargetTag(changedTouch, this.rootTag)
      if (!targetTag) {
        continue;
      }
      const tags = this.getComponentLineage(targetTag)
      const views = tags.map((tag: Tag) => this.viewRegistry.getViewByTag(tag))
      for (const view of views) {
        if (view === null) {
          continue;
        }
        for (const handler of this.gestureHandlerRegistry.getGestureHandlersByViewTag(view.getTag())) {
          if (!this.adapterByViewTag.has(view.getTag()))
            this.adapterByViewTag.set(view.getTag(), new GestureHandlerArkUIAdapter(handler, view, this.logger.cloneWithPrefix("ArkUIAdapter")))
          if (!this.activeViewTags.includes(view.getTag())) {
            const adapter = this.adapterByViewTag.get(view.getTag())
            if (adapter) {
              adapter.handleTouch(e)
            } else {
              console.warn("RNGH: Couldn't find adapter")
            }
          }
          if (e.type === TouchType.Down) {
            this.activeViewTags.push(view.getTag())
          }
        }
      }
      for (const viewTag of this.activeViewTags) {
        const adapter = this.adapterByViewTag.get(viewTag)
        if (adapter) {
          adapter.handleTouch(e)
        }
      }
    }
  }

  private getComponentLineage(tag: Tag): Tag[] {
    let currentTag = tag
    const results: Tag[] = []
    while (currentTag) {
      const cm = this.componentManagerRegistry.getComponentManager(currentTag)
      if (cm instanceof RNViewManager) {
        if (currentTag) {
          results.push(currentTag)
        }
        currentTag = cm.getParentTag()
      } else {
        break
      }
    }
    return results
  }
}
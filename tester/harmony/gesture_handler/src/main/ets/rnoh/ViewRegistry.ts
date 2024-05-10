import { DescriptorRegistry, Tag, } from '@rnoh/react-native-openharmony/ts';
import { ViewArkTS } from './View';
import { View } from '../core';
import type { ViewFinder } from "./RNGHRootTouchHandlerArkTS"

export interface ViewRegistry extends ViewFinder {
  getViewByTag(viewTag: Tag)
  save(view: View)
}

export class ViewRegistryArkTS implements ViewRegistry {
  constructor(
    private descriptorRegistry: DescriptorRegistry,
  ) {
  }

  getViewByTag(viewTag: Tag) {
    return this.createView(viewTag);
  }

  save(view: View) {
    /**
     * Currently, a new View object is created when getViewByTag is called. That was the approach in initial "quick"
     * implementation of this library. The save was introduced later, for the needs of implementation using C-API architecture.
     * C-API architecture is going to replace ArkTS anyway, so there's no point of doing this properly since this class
     * will be removed in the future.
     */
  }

  private createView(tag: Tag): ViewArkTS {
    return new ViewArkTS(this.descriptorRegistry, tag);
  }

  getTouchableViewsAt(
    pos: {
      x: number;
      y: number;
    },
    rootTag: Tag,
  ): ViewArkTS[] {
    const rootView = this.createView(rootTag);
    const results: ViewArkTS[] = [];
    for (const view of this.getTouchableViewsAtPosInView(pos, rootView)) {
      results.push(view);
    }
    return results;
  }

  private getTouchableViewsAtPosInView(
    pos: {
      x: number;
      y: number;
    },
    view: ViewArkTS,
  ) {
    if (!view.isPositionInBounds(pos)) return [];
    const results: ViewArkTS[] = [];
    results.push(view);
    for (const child of this.getChildrenOf(view.getTag())) {
      for (const result of this.getTouchableViewsAtPosInView(pos, child)) {
        results.push(result);
      }
    }
    return results;
  }

  private getChildrenOf(viewTag: Tag): ViewArkTS[] {
    return this.descriptorRegistry.findDescriptorWrapperByTag(viewTag).childrenTags.map((tag) => new ViewArkTS(this.descriptorRegistry, tag))
  }
}


export class ViewRegistryCAPI implements ViewRegistry {
  private viewByTag = new Map<Tag, View>()

  save(view: View) {
    this.viewByTag.set(view.getTag(), view)
  }

  getViewByTag(viewTag: Tag) {
    return this.viewByTag.get(viewTag);
  }

  getTouchableViewsAt(
    pos: {
      x: number;
      y: number;
    },
    rootTag: Tag,
  ): ViewArkTS[] {
    // Finding views is handled on CPP side and provided with the touch event.
    // This method can be removed from ViewRegistry interface once support for ArkTS architecture is removed.
    return []
  }
}

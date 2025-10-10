import { Tag, } from '@rnoh/react-native-openharmony/ts';
import { View, ViewRegistry } from '../core';


export class RNGHViewRegistry implements ViewRegistry {
  private viewByTag = new Map<Tag, View>()

  save(view: View) {
    this.viewByTag.set(view.getTag(), view)
  }

  deleteByTag(viewTag: Tag) {
    this.viewByTag.delete(viewTag)
  }

  getViewByTag(viewTag: Tag) {
    return this.viewByTag.get(viewTag);
  }
}

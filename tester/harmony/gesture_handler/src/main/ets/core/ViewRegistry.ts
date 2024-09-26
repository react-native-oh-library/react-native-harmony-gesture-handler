import { Tag, View } from "./View"
import { ViewFinder } from "./ViewFinder"

export interface ViewRegistry extends ViewFinder {
  getViewByTag(viewTag: Tag): View | undefined
  save(view: View): void
  deleteByTag(viewTag: Tag): void
}

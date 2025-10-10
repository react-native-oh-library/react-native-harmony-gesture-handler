import { Tag, View } from "./View"

export interface ViewRegistry {
  getViewByTag(viewTag: Tag): View | undefined
  save(view: View): void
  deleteByTag(viewTag: Tag): void
}

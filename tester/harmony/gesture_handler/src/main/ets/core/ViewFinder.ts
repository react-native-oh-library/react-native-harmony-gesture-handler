import { Tag, View } from "./View"

export interface ViewFinder {
    getTouchableViewsAt(
      pointRelativeToRoot: {
        x: number,
        y: number
      },
      rootTag: Tag
    ): View[]
  }
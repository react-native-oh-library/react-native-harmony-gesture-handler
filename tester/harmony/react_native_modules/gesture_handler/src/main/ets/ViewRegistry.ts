import { DescriptorRegistry, ComponentManagerRegistry, RNViewManager } from "rnoh/ts"
import { View } from "./View"

export class ViewRegistry {
  constructor(private componentManagerRegistry: ComponentManagerRegistry, private descriptorRegistry: DescriptorRegistry) {
  }

  public getViewByTag(viewTag: number): View {
    return this.maybeCreateView(viewTag)
  }

  private maybeCreateView(viewTag: number): View {
    const componentManager = this.componentManagerRegistry.getComponentManager(viewTag)
    if (componentManager instanceof RNViewManager) {
      return new View(this.componentManagerRegistry, componentManager, this.descriptorRegistry, viewTag)
    }
    return null
  }
}
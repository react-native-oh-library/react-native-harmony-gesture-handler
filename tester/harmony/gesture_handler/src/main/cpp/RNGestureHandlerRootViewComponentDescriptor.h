
#pragma once

// This file was generated.

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewShadowNode.h>

namespace facebook {
namespace react {

extern const char RNGestureHandlerRootViewComponentName[] = "RNGestureHandlerRootView";

class RNGestureHandlerRootViewProps : public ViewProps {
  public:
    RNGestureHandlerRootViewProps() = default;

    RNGestureHandlerRootViewProps(const PropsParserContext &context, const RNGestureHandlerRootViewProps &sourceProps, const RawProps &rawProps)
        : ViewProps(context, sourceProps, rawProps) {}
};

using RNGestureHandlerRootViewShadowNode = ConcreteViewShadowNode<
    RNGestureHandlerRootViewComponentName,
    RNGestureHandlerRootViewProps,
    ViewEventEmitter>;

class RNGestureHandlerRootViewComponentDescriptor final
    : public ConcreteComponentDescriptor<RNGestureHandlerRootViewShadowNode> {
  public:
    RNGestureHandlerRootViewComponentDescriptor(ComponentDescriptorParameters const &parameters)
        : ConcreteComponentDescriptor(parameters) {}
};

} // namespace react
} // namespace facebook

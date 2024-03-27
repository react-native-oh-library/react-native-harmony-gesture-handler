
#pragma once

// This file was generated.

#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/components/view/ViewShadowNode.h>

namespace facebook {
namespace react {

extern const char RNGestureHandlerButtonComponentName[] = "RNGestureHandlerButton";

class RNGestureHandlerButtonProps : public ViewProps {
  public:
    RNGestureHandlerButtonProps() = default;

    RNGestureHandlerButtonProps(const PropsParserContext &context, const RNGestureHandlerButtonProps &sourceProps, const RawProps &rawProps)
        : ViewProps(context, sourceProps, rawProps) {}
};

using RNGestureHandlerButtonShadowNode = ConcreteViewShadowNode<
    RNGestureHandlerButtonComponentName,
    RNGestureHandlerButtonProps,
    ViewEventEmitter>;

class RNGestureHandlerButtonComponentDescriptor final
    : public ConcreteComponentDescriptor<RNGestureHandlerButtonShadowNode> {
  public:
    RNGestureHandlerButtonComponentDescriptor(ComponentDescriptorParameters const &parameters)
        : ConcreteComponentDescriptor(parameters) {}
};

} // namespace react
} // namespace facebook

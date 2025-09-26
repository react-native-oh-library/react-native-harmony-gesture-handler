#ifndef RNGESTUREHANDLERBUTTONCOMPONENTINSTANCE_H
#define RNGESTUREHANDLERBUTTONCOMPONENTINSTANCE_H
#pragma once
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"
#include "generated/RNGestureHandlerButtonComponentDescriptor.h"

namespace rnoh {
class RNGestureHandlerButtonComponentInstance
    : public CppComponentInstance<facebook::react::RNGestureHandlerButtonShadowNode> {
public:
    explicit RNGestureHandlerButtonComponentInstance(Context context);
    StackNode &getLocalRootArkUINode() override;
    void onChildInserted(ComponentInstance::Shared const &childComponentInstance, std::size_t index) override;
    void onChildRemoved(ComponentInstance::Shared const &childComponentInstance) override;

private:
    StackNode m_stackNode;
};
} // namespace rnoh
#endif // RNGESTUREHANDLERBUTTONCOMPONENTINSTANCE_H
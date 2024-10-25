#pragma once
#import "RNOH/CppComponentInstance.h"
#import "RNOH/arkui/StackNode.h"
#import "generated/RNGestureHandlerButtonComponentDescriptor.h"

namespace rnoh {
class RNGestureHandlerButtonComponentInstance
    : public CppComponentInstance<facebook::react::RNGestureHandlerButtonShadowNode> {
public:
    RNGestureHandlerButtonComponentInstance(Context context);

    StackNode &getLocalRootArkUINode() override;
    void onChildInserted(ComponentInstance::Shared const &childComponentInstance, std::size_t index) override;
    void onChildRemoved(ComponentInstance::Shared const &childComponentInstance) override;

private:
    StackNode m_stackNode;
};
} // namespace rnoh
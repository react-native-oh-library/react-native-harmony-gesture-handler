#pragma once
#import "RNOH/CppComponentInstance.h"
#import "RNOH/arkui/StackNode.h"
#import "../RNGestureHandlerButtonComponentDescriptor.h"

namespace rnoh {
    class RNGestureHandlerButtonComponentInstance
        : public CppComponentInstance<facebook::react::RNGestureHandlerButtonShadowNode> {
    private:
        StackNode m_stackNode;

    public:
        RNGestureHandlerButtonComponentInstance(Context context) : CppComponentInstance(std::move(context)) {};

        StackNode &getLocalRootArkUINode() override { return m_stackNode; };

        void onChildInserted(ComponentInstance::Shared const &childComponentInstance, std::size_t index) override {
            CppComponentInstance::onChildInserted(childComponentInstance, index);
            m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
        };

        void onChildRemoved(ComponentInstance::Shared const &childComponentInstance) override {
            CppComponentInstance::onChildRemoved(childComponentInstance);
            m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
        };
    };
} // namespace rnoh

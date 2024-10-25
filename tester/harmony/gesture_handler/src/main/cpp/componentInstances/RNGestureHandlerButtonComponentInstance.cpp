#pragma once

#include "RNGestureHandlerButtonComponentInstance.h"

namespace rnoh {
RNGestureHandlerButtonComponentInstance::RNGestureHandlerButtonComponentInstance(Context context)
    : CppComponentInstance(std::move(context)){};

StackNode &RNGestureHandlerButtonComponentInstance::getLocalRootArkUINode() { return m_stackNode; };

void RNGestureHandlerButtonComponentInstance::onChildInserted(ComponentInstance::Shared const &childComponentInstance,
                                                              std::size_t index) {
    CppComponentInstance::onChildInserted(childComponentInstance, index);
    m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
};

void RNGestureHandlerButtonComponentInstance::onChildRemoved(ComponentInstance::Shared const &childComponentInstance) {
    CppComponentInstance::onChildRemoved(childComponentInstance);
    m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
};
} // namespace rnoh
#pragma once

#include "RNGestureHandlerButtonComponentInstance.h"

namespace rnoh {
RNGestureHandlerButtonComponentInstance::RNGestureHandlerButtonComponentInstance(Context context)
    : BaseRNGestureHandlerButtonComponentInstance(std::move(context)){};

StackNode &RNGestureHandlerButtonComponentInstance::getLocalRootArkUINode() { return m_stackNode; };

void RNGestureHandlerButtonComponentInstance::onChildInserted(ComponentInstance::Shared const &childComponentInstance,
                                                              std::size_t index)
{
    Super::onChildInserted(childComponentInstance, index);
    m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
};

void RNGestureHandlerButtonComponentInstance::onChildRemoved(ComponentInstance::Shared const &childComponentInstance)
{
    Super::onChildRemoved(childComponentInstance);
    m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
};
} // namespace rnoh
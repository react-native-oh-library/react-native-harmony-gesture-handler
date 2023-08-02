#include "GestureHandlerPackage.h"
#include "RNGestureHandlerRootViewComponentDescriptor.h"

using namespace rnoh;
using namespace facebook;

std::vector<react::ComponentDescriptorProvider> GestureHandlerPackage::createComponentDescriptorProviders() {
    return {react::concreteComponentDescriptorProvider<react::RNGestureHandlerRootViewComponentDescriptor>()};
}

EventEmitRequestHandlers GestureHandlerPackage::createEventEmitRequestHandlers() {
    return {
        std::make_shared<react::RNGestureHandlerRootViewEventEmitRequestHandler>(),
    };
}
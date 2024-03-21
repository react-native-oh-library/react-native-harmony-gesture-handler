#pragma once
#include "GestureHandlerPackage.h"
#include "componentInstances/RNGestureHandlerButtonComponentInstance.h"
#include "componentInstances/RNGestureHandlerRootViewComponentInstance.h"

using namespace rnoh;
using namespace facebook;

class RNGHEventEmitRequestHandler : public EventEmitRequestHandler {
    void handleEvent(EventEmitRequestHandler::Context const &ctx) override {
        auto eventEmitter = ctx.shadowViewRegistry->getEventEmitter<facebook::react::ViewEventEmitter>(ctx.tag);
        if (eventEmitter == nullptr) {
            return;
        }
        if (ctx.eventName == "onGestureHandlerEvent") {
            eventEmitter->dispatchEvent(ctx.eventName, ArkJS(ctx.env).getDynamic(ctx.payload));
        }
    }
};

class RNOHCorePackageComponentInstanceFactoryDelegate : public ComponentInstanceFactoryDelegate {
public:
    using ComponentInstanceFactoryDelegate::ComponentInstanceFactoryDelegate;

    ComponentInstance::Shared create(ComponentInstance::Context ctx) override {
        if (ctx.componentName == "RNGestureHandlerButton") {
            return std::make_shared<RNGestureHandlerButtonComponentInstance>(ctx);
        } else if (ctx.componentName == "RNGestureHandlerRootView") {
            return std::make_shared<RNGestureHandlerRootViewComponentInstance>(ctx);
        }

        return nullptr;
    }
};


EventEmitRequestHandlers GestureHandlerPackage::createEventEmitRequestHandlers() {
    return {
        std::make_shared<RNGHEventEmitRequestHandler>(),
    };
}

ComponentInstanceFactoryDelegate::Shared GestureHandlerPackage::createComponentInstanceFactoryDelegate() {
    return std::make_shared<RNOHCorePackageComponentInstanceFactoryDelegate>();
}

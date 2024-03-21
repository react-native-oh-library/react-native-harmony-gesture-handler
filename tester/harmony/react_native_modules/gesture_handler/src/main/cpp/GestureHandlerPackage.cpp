#pragma once
#include "GestureHandlerPackage.h"
<<<<<<< HEAD
#include "RNOH/RNInstanceCAPI.h"
=======
>>>>>>> 5e7d7ff (feat: support C-API arch)
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

<<<<<<< HEAD
=======
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

>>>>>>> 5e7d7ff (feat: support C-API arch)

EventEmitRequestHandlers GestureHandlerPackage::createEventEmitRequestHandlers() {
  return {
    std::make_shared<RNGHEventEmitRequestHandler>(),
  };
}

ComponentInstanceFactoryDelegate::Shared GestureHandlerPackage::createComponentInstanceFactoryDelegate() {
<<<<<<< HEAD
  return std::make_shared<RNOHCorePackageComponentInstanceFactoryDelegate>();
}

class ScrollLockerArkTSMessageHandler : public ArkTSMessageHandler {
public:
  void handleArkTSMessage(const Context &ctx) override {
    if (ctx.messageName == "RNGH::SET_NATIVE_RESPONDERS_BLOCK") {
      auto targetComponentInstanceTag = ctx.messagePayload["targetTag"].asDouble();
      auto shouldBlock = ctx.messagePayload["shouldBlock"].asBool();
      auto rnInstance = ctx.rnInstance.lock();
      if (rnInstance != nullptr) {
        auto rnInstanceCAPI = std::dynamic_pointer_cast<RNInstanceCAPI>(rnInstance);
        if (rnInstanceCAPI != nullptr) {
          auto tmpComponentInstance = rnInstanceCAPI->findComponentInstanceByTag(targetComponentInstanceTag);
          while (tmpComponentInstance != nullptr) {
            tmpComponentInstance->setNativeResponderBlocked(shouldBlock, "RNGH");
            tmpComponentInstance = tmpComponentInstance->getParent().lock();
          }
        }
      }
    }
  };
};

std::vector<ArkTSMessageHandler::Shared> GestureHandlerPackage::createArkTSMessageHandlers() {
  return {std::make_shared<ScrollLockerArkTSMessageHandler>()};
}
=======
    return std::make_shared<RNOHCorePackageComponentInstanceFactoryDelegate>();
}
>>>>>>> 5e7d7ff (feat: support C-API arch)

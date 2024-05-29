#pragma once
#include "GestureHandlerPackage.h"
#include "RNOH/RNInstanceCAPI.h"
#include "componentInstances/RNGestureHandlerButtonComponentInstance.h"
#include "componentInstances/RNGestureHandlerRootViewComponentInstance.h"
#include <glog/logging.h>

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
            auto rnghRootViewComponentInstance =
              std::dynamic_pointer_cast<RNGestureHandlerRootViewComponentInstance>(tmpComponentInstance);
            if (rnghRootViewComponentInstance != nullptr) {
              /**
               * Don't block Scrolls above RNGHRootView to match Android behavior.
               */
              return;
            } 
            tmpComponentInstance->setNativeResponderBlocked(shouldBlock, "RNGH");
            tmpComponentInstance = tmpComponentInstance->getParent().lock();
          }
        }
      }
    } else if (ctx.messageName == "RNGH::ROOT_VIEW_IS_HANDLING_TOUCHES") {
      auto descendantViewTag = ctx.messagePayload["descendantViewTag"].asDouble();
      auto isHandlingTouches = ctx.messagePayload["isHandlingTouches"].asBool();
      auto rnInstance = ctx.rnInstance.lock();
      if (rnInstance != nullptr) {
        auto rnInstanceCAPI = std::dynamic_pointer_cast<RNInstanceCAPI>(rnInstance);
        if (rnInstanceCAPI != nullptr) {
          auto tmpComponentInstance = rnInstanceCAPI->findComponentInstanceByTag(descendantViewTag);
          while (tmpComponentInstance != nullptr) {
            tmpComponentInstance = tmpComponentInstance->getParent().lock();
              if (tmpComponentInstance) {
                auto rnghRootViewComponentInstance = std::dynamic_pointer_cast<RNGestureHandlerRootViewComponentInstance>(tmpComponentInstance);
                if (rnghRootViewComponentInstance) {
                  rnghRootViewComponentInstance->setIsHandlingTouches(isHandlingTouches);
                }
              }
          }
        }
      }
    }
  };
};

std::vector<ArkTSMessageHandler::Shared> GestureHandlerPackage::createArkTSMessageHandlers() {
  return {std::make_shared<ScrollLockerArkTSMessageHandler>()};
}
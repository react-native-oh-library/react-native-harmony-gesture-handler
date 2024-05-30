#pragma once
#include "GestureHandlerPackage.h"
#include "RNOH/RNInstanceCAPI.h"
#include "componentInstances/RNGestureHandlerButtonComponentInstance.h"
#include "componentInstances/RNGestureHandlerRootViewComponentInstance.h"
#include "RNOH/ArkTSTurboModule.h"
#include "RNGestureHandlerModule.h"
#include "RNGestureHandlerButtonComponentDescriptor.h"
#include "RNGestureHandlerRootViewComponentDescriptor.h"
#include "RNGestureHandlerButtonJSIBinder.h"
#include "RNGestureHandlerRootViewJSIBinder.h"
#include <glog/logging.h>

using namespace rnoh;
using namespace facebook;

class GestureHandlerTurboModuleFactoryDelegate : public TurboModuleFactoryDelegate {
public:
    SharedTurboModule createTurboModule(Context ctx, const std::string &name) const override {
        if (name == "RNGestureHandlerModule") {
            return std::make_shared<RNGestureHandlerModule>(ctx, name);
        }
        return nullptr;
    };
};


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

std::unique_ptr<TurboModuleFactoryDelegate> GestureHandlerPackage::createTurboModuleFactoryDelegate() {
    return std::make_unique<GestureHandlerTurboModuleFactoryDelegate>();
}

std::vector<react::ComponentDescriptorProvider> GestureHandlerPackage::createComponentDescriptorProviders() {
    return {
        react::concreteComponentDescriptorProvider<react::RNGestureHandlerRootViewComponentDescriptor>(),
        react::concreteComponentDescriptorProvider<react::RNGestureHandlerButtonComponentDescriptor>(),
    };
}

ComponentJSIBinderByString GestureHandlerPackage::createComponentJSIBinderByName() {
    return {
        {"RNGestureHandlerButton", std::make_shared<RNGestureHandlerButtonJSIBinder>()},
        {"RNGestureHandlerRootView", std::make_shared<RNGestureHandlerRootViewJSIBinder>()},
    };
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
          
          std::vector<ComponentInstance::Shared> ancestors;
          auto tmpComponentInstance = rnInstanceCAPI->findComponentInstanceByTag(targetComponentInstanceTag);
          while (tmpComponentInstance != nullptr) {
            ancestors.push_back(tmpComponentInstance);
            tmpComponentInstance = tmpComponentInstance->getParent().lock();
          }
          if (ancestors.size() == 0) {
            return;
          }
          /**
           * Ensure consistent behavior with Android by not blocking scrolls above the GestureHandlerRootView handling
           * the touch. If there are multiple nested GestureHandlerRootViews, the one nearest to the actual root will
           * handle the touch.
           */
          auto isChangingResponderStatusAllowed = false; 
          for (size_t i = ancestors.size() - 1; i > 0; i--) {
            auto ancestor = ancestors[i];
            if (!isChangingResponderStatusAllowed) {
              auto rootView = std::dynamic_pointer_cast<RNGestureHandlerRootViewComponentInstance>(ancestor);
              if (rootView != nullptr) {
                isChangingResponderStatusAllowed = true;
              }
            } else {
              ancestor->setNativeResponderBlocked(shouldBlock, "RNGH");
            } 
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
              auto rnghRootViewComponentInstance =
                std::dynamic_pointer_cast<RNGestureHandlerRootViewComponentInstance>(tmpComponentInstance);
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

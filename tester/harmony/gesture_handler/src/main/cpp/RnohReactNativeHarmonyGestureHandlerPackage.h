#pragma once
#include "RNOH/Package.h"

namespace rnoh {
class RnohReactNativeHarmonyGestureHandlerPackage : public Package {
public:
    RnohReactNativeHarmonyGestureHandlerPackage(Package::Context ctx) : Package(ctx) {}
    
    std::unique_ptr<TurboModuleFactoryDelegate> createTurboModuleFactoryDelegate() override;
    
    std::vector<facebook::react::ComponentDescriptorProvider> createComponentDescriptorProviders() override;

    ComponentJSIBinderByString createComponentJSIBinderByName() override;
    
    EventEmitRequestHandlers createEventEmitRequestHandlers();

    ComponentInstanceFactoryDelegate::Shared createComponentInstanceFactoryDelegate();

    std::vector<ArkTSMessageHandler::Shared> createArkTSMessageHandlers() override;
};
} // namespace rnoh

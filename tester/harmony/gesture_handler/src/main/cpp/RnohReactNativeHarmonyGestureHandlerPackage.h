#ifndef RNOHREACTNATIVEHARMONYGESTUREHANDLERPACKAGE_H
#define RNOHREACTNATIVEHARMONYGESTUREHANDLERPACKAGE_H
#pragma once
#include "RNOH/Package.h"

namespace rnoh {
class RnohReactNativeHarmonyGestureHandlerPackage : public Package {
public:
    explicit RnohReactNativeHarmonyGestureHandlerPackage(Package::Context ctx) : Package(ctx) {}

    EventEmitRequestHandlers createEventEmitRequestHandlers();

    ComponentInstanceFactoryDelegate::Shared createComponentInstanceFactoryDelegate();

    std::vector<ArkTSMessageHandler::Shared> createArkTSMessageHandlers() override;
};
} // namespace rnoh
#endif // RNOHREACTNATIVEHARMONYGESTUREHANDLERPACKAGE_H
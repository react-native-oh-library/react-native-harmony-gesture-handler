#pragma once
#include "RNOH/Package.h"

namespace rnoh {
    class GestureHandlerPackage : public Package {
    public:
        GestureHandlerPackage(Package::Context ctx) : Package(ctx) {}

        EventEmitRequestHandlers createEventEmitRequestHandlers();

        ComponentInstanceFactoryDelegate::Shared createComponentInstanceFactoryDelegate();
    };
} // namespace rnoh

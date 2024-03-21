#pragma once
#include "RNOH/Package.h"

namespace rnoh {
    class GestureHandlerPackage : public Package {
    public:
        GestureHandlerPackage(Package::Context ctx) : Package(ctx) {}

        EventEmitRequestHandlers createEventEmitRequestHandlers();

        ComponentInstanceFactoryDelegate::Shared createComponentInstanceFactoryDelegate();
<<<<<<< HEAD

        std::vector<ArkTSMessageHandler::Shared> createArkTSMessageHandlers() override;
=======
>>>>>>> 5e7d7ff (feat: support C-API arch)
    };
} // namespace rnoh

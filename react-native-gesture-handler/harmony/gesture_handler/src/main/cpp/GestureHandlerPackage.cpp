#include "GestureHandlerPackage.h"

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

EventEmitRequestHandlers GestureHandlerPackage::createEventEmitRequestHandlers() {
    return {
        std::make_shared<RNGHEventEmitRequestHandler>(),
    };
}

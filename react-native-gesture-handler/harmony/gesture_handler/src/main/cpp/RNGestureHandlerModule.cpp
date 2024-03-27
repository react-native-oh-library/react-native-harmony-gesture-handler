
#include "RNGestureHandlerModule.h"

// This file was generated.

namespace rnoh {
using namespace facebook;

RNGestureHandlerModule::RNGestureHandlerModule(const ArkTSTurboModule::Context ctx, const std::string name) : ArkTSTurboModule(ctx, name) {
    methodMap_ = {
        ARK_METHOD_METADATA(handleSetJSResponder, 2),
        ARK_METHOD_METADATA(handleClearJSResponder, 0),
        ARK_METHOD_METADATA(createGestureHandler, 3),
        ARK_METHOD_METADATA(attachGestureHandler, 3),
        ARK_METHOD_METADATA(updateGestureHandler, 2),
        ARK_METHOD_METADATA(dropGestureHandler, 1),
        ARK_METHOD_METADATA(install, 0),
        ARK_METHOD_METADATA(flushOperations, 0),
    };
}

} // namespace rnoh

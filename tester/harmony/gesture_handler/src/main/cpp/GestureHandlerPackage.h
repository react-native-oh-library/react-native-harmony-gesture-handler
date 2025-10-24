/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
#ifndef GESTUREHANDLERPACKAGE_H
#define GESTUREHANDLERPACKAGE_H
#pragma once
#include "generated/RNOH/generated/BaseReactNativeGestureHandlerPackage.h"
#include "componentInstances/RNGestureHandlerButtonComponentInstance.h"
#include "componentInstances/RNGestureHandlerRootViewComponentInstance.h"
namespace rnoh {
/**
 * @deprecated: Use RnohReactNativeHarmonyGestureHandlerPackage instead (2024-10-10)
 */
class GestureHandlerPackage : public BaseReactNativeGestureHandlerPackage {
    using Super = BaseReactNativeGestureHandlerPackage;
    using Super::Super;
    public:
    GestureHandlerPackage(Package::Context ctx) : Super(ctx) {}

    ComponentInstance::Shared createComponentInstance(const ComponentInstance::Context &ctx)
    {
        if (ctx.componentName == "RNGestureHandlerButton") {
            return std::make_shared<RNGestureHandlerButtonComponentInstance>(ctx);
        } else if (ctx.componentName == "RNGestureHandlerRootView") {
            return std::make_shared<RNGestureHandlerRootViewComponentInstance>(ctx);
        }
        return nullptr;
    };
};
} // namespace rnoh
#endif // GESTUREHANDLERPACKAGE_H
#pragma once
#import "RNOH/CppComponentInstance.h"
#import "RNOH/arkui/StackNode.h"
#import "RNOH/arkui/ArkUINodeRegistry.h"
#import "RNOH/arkui/NativeNodeApi.h"
#import "RNGestureHandlerRootViewComponentDescriptor.h"

namespace rnoh {
    class RNGestureHandlerRootViewComponentInstance
        : public CppComponentInstance<facebook::react::RNGestureHandlerRootViewShadowNode>,
          public TouchEventHandler {
    private:
        StackNode m_stackNode;

    public:
        RNGestureHandlerRootViewComponentInstance(Context context) : CppComponentInstance(std::move(context)) {
            ArkUINodeRegistry::getInstance().registerTouchHandler(&m_stackNode, this);
            NativeNodeApi::getInstance()->registerNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT,
                                                            NODE_TOUCH_EVENT, 0);
            m_deps->arkTSChannel->postMessage("RNGH::ROOT_CREATED", m_tag);
        };

        ~RNGestureHandlerRootViewComponentInstance() override {
            NativeNodeApi::getInstance()->unregisterNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT);
        }

        StackNode &getLocalRootArkUINode() override { return m_stackNode; };

        void onTouchEvent(ArkUI_UIInputEvent *e) override {
            folly::dynamic payload = folly::dynamic::object;
            payload["action"] = OH_ArkUI_UIInputEvent_GetAction(e);
            folly::dynamic touchPoints = folly::dynamic::array();
            auto activeWindowX = OH_ArkUI_PointerEvent_GetWindowX(e);
            auto activeWindowY = OH_ArkUI_PointerEvent_GetWindowY(e);
            int32_t pointerCount = OH_ArkUI_PointerEvent_GetPointerCount(e);
            int activePointerIdx = 0;
            for (int i = 0; i < pointerCount; i++) {
                auto touchPoint = this->convertNodeTouchPointToDynamic(e, i);
                touchPoints.push_back(touchPoint);
                if (activeWindowX == touchPoint["windowX"].asDouble() &&
                    activeWindowY == touchPoint["windowY"].asDouble()) {
                    activePointerIdx = i;
                }
            }
            payload["actionTouch"] = touchPoints[activePointerIdx];
            payload["touchPoints"] = touchPoints;
            payload["sourceType"] = OH_ArkUI_UIInputEvent_GetSourceType(e);
            payload["timestamp"] = OH_ArkUI_UIInputEvent_GetEventTime(e);
            payload["rootTag"] = m_tag;
            m_deps->arkTSChannel->postMessage("RNGH::TOUCH_EVENT", payload);
        }

    private:
        folly::dynamic convertNodeTouchPointToDynamic(ArkUI_UIInputEvent *e, int32_t index = 0) {
            folly::dynamic result = folly::dynamic::object;
            result["pointerId"] = OH_ArkUI_PointerEvent_GetPointerId(e, index);
            result["windowX"] = OH_ArkUI_PointerEvent_GetWindowXByIndex(e, index);
            result["windowY"] = OH_ArkUI_PointerEvent_GetWindowYByIndex(e, index);
            return result;
        }

    protected:
        void onChildInserted(ComponentInstance::Shared const &childComponentInstance, std::size_t index) override {
            CppComponentInstance::onChildInserted(childComponentInstance, index);
            m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
        };

        void onChildRemoved(ComponentInstance::Shared const &childComponentInstance) override {
            CppComponentInstance::onChildRemoved(childComponentInstance);
            m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
        };
    };
} // namespace rnoh
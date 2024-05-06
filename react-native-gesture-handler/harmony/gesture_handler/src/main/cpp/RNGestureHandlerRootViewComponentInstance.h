#pragma once
#import "RNOH/CppComponentInstance.h"
#import "RNOH/arkui/StackNode.h"
#import "RNOH/arkui/ArkUINodeRegistry.h"
#import "RNOH/arkui/NativeNodeApi.h"
#import "RNGestureHandlerRootViewComponentDescriptor.h"
#include "RNOH/arkui/TouchEventDispatcher.h"

namespace rnoh {
class RNGestureHandlerRootViewComponentInstance
    : public CppComponentInstance<facebook::react::RNGestureHandlerRootViewShadowNode>,
      public TouchEventHandler {
private:
    StackNode m_stackNode;

public:
    RNGestureHandlerRootViewComponentInstance(Context context) : CppComponentInstance(std::move(context)) {
        ArkUINodeRegistry::getInstance().registerTouchHandler(&m_stackNode, this);
        NativeNodeApi::getInstance()->registerNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT, 0, nullptr);
        m_deps->arkTSChannel->postMessage("RNGH::ROOT_CREATED", m_tag);
    };

    ~RNGestureHandlerRootViewComponentInstance() {
        ArkUINodeRegistry::getInstance().unregisterTouchHandler(&m_stackNode);
        NativeNodeApi::getInstance()->unregisterNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT);
    }

    StackNode &getLocalRootArkUINode() override { return m_stackNode; };

    void onTouchEvent(ArkUI_UIInputEvent *e) override {
        folly::dynamic payload = folly::dynamic::object;
        payload["action"] = static_cast<int>(OH_ArkUI_UIInputEvent_GetAction(e));
        payload["actionTouch"] = this->convertNodeTouchPointToDynamic(getActiveTouchFromEvent(e));
        folly::dynamic touchPoints = folly::dynamic::array();
        touchPoints.push_back(this->convertNodeTouchPointToDynamic(getActiveTouchFromEvent(e)));
        payload["touchPoints"] = touchPoints;
        payload["sourceType"] = static_cast<int>(OH_ArkUI_UIInputEvent_GetSourceType(e));
        payload["timestamp"] = OH_ArkUI_UIInputEvent_GetEventTime(e);
        payload["rootTag"] = m_tag;
        m_deps->arkTSChannel->postMessage("RNGH::TOUCH_EVENT", payload);
    }

private:
    struct TouchPoint {
        int32_t contactAreaHeight;
        int32_t contactAreaWidth;
        int32_t id;
        int32_t nodeX;
        int32_t nodeY;
        int64_t pressedTime;
        double pressure;
        int32_t rawX;
        int32_t rawY;
        int32_t screenX;
        int32_t screenY;
        double tiltX;
        double tiltY;
        int32_t toolHeight;
        int32_t toolWidth;
        int32_t toolX;
        int32_t toolY;
        int32_t toolType;
        int32_t windowX;
        int32_t windowY;
    };

    TouchPoint getActiveTouchFromEvent(ArkUI_UIInputEvent *event) {
        TouchPoint actionTouch{};
        actionTouch = TouchPoint{
            .contactAreaHeight = int32_t(OH_ArkUI_PointerEvent_GetTouchAreaHeight(event, 0)),
            .contactAreaWidth = int32_t(OH_ArkUI_PointerEvent_GetTouchAreaWidth(event, 0)),
            .id = OH_ArkUI_PointerEvent_GetPointerId(event, 0),
            .nodeX = int32_t(OH_ArkUI_PointerEvent_GetX(event)),
            .nodeY = int32_t(OH_ArkUI_PointerEvent_GetY(event)),
            .pressure = double(OH_ArkUI_PointerEvent_GetPressure(event, 0)),
            .screenX = int32_t(OH_ArkUI_PointerEvent_GetDisplayX(event)),
            .screenY = int32_t(OH_ArkUI_PointerEvent_GetDisplayY(event)),
            .tiltX = double(OH_ArkUI_PointerEvent_GetTiltX(event, 0)),
            .tiltY = double(OH_ArkUI_PointerEvent_GetTiltX(event, 0)),
            .toolType = int32_t(OH_ArkUI_UIInputEvent_GetToolType(event)),
            .windowX = int32_t(OH_ArkUI_PointerEvent_GetWindowX(event)),
            .windowY = int32_t(OH_ArkUI_PointerEvent_GetWindowY(event)),
        };
        return actionTouch;
    }

    folly::dynamic convertNodeTouchPointToDynamic(TouchPoint actionTouch) {
        folly::dynamic result = folly::dynamic::object;
        result["contactAreaHeight"] = actionTouch.contactAreaHeight;
        result["contactAreaWidth"] = actionTouch.contactAreaWidth;
        result["id"] = actionTouch.id;
        result["nodeX"] = actionTouch.nodeX;
        result["nodeY"] = actionTouch.nodeY;
        //         result["pressedTime"] = actionTouch.pressedTime;
        result["pressure"] = actionTouch.pressure;
        //         result["rawX"] = actionTouch.rawX;
        //         result["rawY"] = actionTouch.rawY;
        result["screenX"] = actionTouch.screenX;
        result["screenY"] = actionTouch.screenY;
        result["tiltX"] = actionTouch.tiltX;
        result["tiltY"] = actionTouch.tiltY;
        //         result["toolHeight"] = actionTouch.toolHeight;
        //         result["toolWidth"] = actionTouch.toolWidth;
        //         result["toolX"] = actionTouch.toolX;
        //         result["toolY"] = actionTouch.toolY;
        result["toolType"] = static_cast<int>(actionTouch.toolType);
        result["windowX"] = actionTouch.windowX;
        result["windowY"] = actionTouch.windowY;
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
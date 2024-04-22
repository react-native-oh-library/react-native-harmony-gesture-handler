#pragma once
#import "RNOH/CppComponentInstance.h"
#import "RNOH/arkui/StackNode.h"
#import "RNOH/arkui/ArkUINodeRegistry.h"
#import "RNOH/arkui/NativeNodeApi.h"
#import "generated/RNGestureHandlerRootViewComponentDescriptor.h"

namespace rnoh {
    class RNGestureHandlerRootViewComponentInstance
        : public CppComponentInstance<facebook::react::RNGestureHandlerRootViewShadowNode>,
          public TouchEventHandler {
    private:
        StackNode m_stackNode;

    public:
        RNGestureHandlerRootViewComponentInstance(Context context) : CppComponentInstance(std::move(context)) {
            ArkUINodeRegistry::getInstance().registerTouchHandler(&m_stackNode, this);
            NativeNodeApi::getInstance()->registerNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT, NODE_TOUCH_EVENT, 0);
            m_deps->arkTSChannel->postMessage("RNGH::ROOT_CREATED", m_tag);
        };

        StackNode &getLocalRootArkUINode() override { return m_stackNode; };

        void onTouchEvent(ArkUI_UIInputEvent* e) override {
            folly::dynamic payload = folly::dynamic::object;
            payload["action"] = OH_ArkUI_UIInputEvent_GetAction(e);
            payload["actionTouch"] = this->convertNodeTouchPointToDynamic(e);
            folly::dynamic touchPoints = folly::dynamic::array();
            touchPoints.push_back(this->convertNodeTouchPointToDynamic(e));
            payload["touchPoints"] = touchPoints;
            payload["sourceType"] = OH_ArkUI_UIInputEvent_GetSourceType(e);
            payload["timestamp"] = OH_ArkUI_UIInputEvent_GetEventTime(e);
            payload["rootTag"] = m_tag;
            m_deps->arkTSChannel->postMessage("RNGH::TOUCH_EVENT", payload);
        }
    private: 
        folly::dynamic convertNodeTouchPointToDynamic(ArkUI_UIInputEvent* e) {
            folly::dynamic result = folly::dynamic::object;
            result["pointerId"] = OH_ArkUI_PointerEvent_GetPointerId(e, 0);
            result["windowX"] = OH_ArkUI_PointerEvent_GetWindowX(e);
            result["windowY"] = OH_ArkUI_PointerEvent_GetWindowY(e);
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
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
            NativeNodeApi::getInstance()->registerNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT, 0);
            m_deps->arkTSChannel->postMessage("RNGH::ROOT_CREATED", m_tag);
        };

        StackNode &getLocalRootArkUINode() override { return m_stackNode; };

        void onTouchEvent(ArkUI_NodeTouchEvent e) override {
            folly::dynamic payload = folly::dynamic::object;
            payload["action"] = static_cast<int>(e.action);
            payload["actionTouch"] = this->convertNodeTouchPointToDynamic(e.actionTouch);
            folly::dynamic touchPoints = folly::dynamic::array();
            touchPoints.push_back(this->convertNodeTouchPointToDynamic(e.actionTouch));
            payload["touchPoints"] = touchPoints;
            payload["sourceType"] = static_cast<int>(e.sourceType);
            payload["timestamp"] = e.timeStamp;
            payload["rootTag"] = m_tag;
            m_deps->arkTSChannel->postMessage("RNGH::TOUCH_EVENT", payload);
        }
    private: 
        folly::dynamic convertNodeTouchPointToDynamic(ArkUI_NodeTouchPoint actionTouch) {
            folly::dynamic result = folly::dynamic::object;
            result["contactAreaHeight"] = actionTouch.contactAreaHeight;
            result["contactAreaWidth"] = actionTouch.contactAreaWidth;
            result["id"] = actionTouch.id;
            result["nodeX"] = actionTouch.nodeX;
            result["nodeY"] = actionTouch.nodeY;
            result["pressedTime"] = actionTouch.pressedTime;
            result["pressure"] = actionTouch.pressure;
            result["rawX"] = actionTouch.rawX;
            result["rawY"] = actionTouch.rawY;
            result["screenX"] = actionTouch.screenX;
            result["screenY"] = actionTouch.screenY;
            result["tiltX"] = actionTouch.tiltX;
            result["tiltY"] = actionTouch.tiltY;
            result["toolHeight"] = actionTouch.toolHeight;
            result["toolWidth"] = actionTouch.toolWidth;
            result["toolX"] = actionTouch.toolX;
            result["toolY"] = actionTouch.toolY;
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
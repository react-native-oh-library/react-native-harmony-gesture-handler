#pragma once
#import "RNOH/CppComponentInstance.h"
#import "RNOH/arkui/StackNode.h"
#import "RNOH/arkui/ArkUINodeRegistry.h"
#import "RNOH/arkui/NativeNodeApi.h"
#import "RNOH/RNInstanceCAPI.h"
#import "generated/RNGestureHandlerRootViewComponentDescriptor.h"

namespace rnoh {
  class RNGestureHandlerRootViewComponentInstance
      : public CppComponentInstance<facebook::react::RNGestureHandlerRootViewShadowNode>,
        public TouchEventHandler {
    using Point = facebook::react::Point;

    /**
     * This function is borrowed from TouchEventDispatcher
     */
    static TouchTarget::Shared findTargetForTouchPoint(Point const &point, TouchTarget::Shared const &target) {
      bool canHandleTouch =
        target->canHandleTouch() && target->containsPoint(point) && (target->getTouchEventEmitter() != nullptr);
      bool canChildrenHandleTouch = target->canChildrenHandleTouch() && target->containsPointInBoundingBox(point);

      if (canChildrenHandleTouch) {
        auto children = target->getTouchTargetChildren();
        // we want to check the children in reverse order, since the last child is the topmost one
        std::reverse(children.begin(), children.end());
        for (auto const &child : children) {
          auto childPoint = target->computeChildPoint(point, child);
          auto result = findTargetForTouchPoint(childPoint, child);
          if (result != nullptr) {
            return result;
          }
        }
      }
      if (canHandleTouch) {
        return target;
      }
      return nullptr;
    }

  private:
    bool m_isHandlingTouches = false;
    StackNode m_stackNode;

    struct TouchableView {
      Tag tag;
      facebook::react::Float width;
      facebook::react::Float height;
      facebook::react::Float x;
      facebook::react::Float y;
    };

  public:
    RNGestureHandlerRootViewComponentInstance(Context context) : CppComponentInstance(std::move(context)) {
      ArkUINodeRegistry::getInstance().registerTouchHandler(&m_stackNode, this);
      NativeNodeApi::getInstance()->registerNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT,
                                                      NODE_TOUCH_EVENT, 0);
      auto rnInstance = m_deps->rnInstance.lock();
      if (rnInstance) {
        rnInstance->postMessageToArkTS("RNGH::ROOT_CREATED", m_tag);
      }
    };

    ~RNGestureHandlerRootViewComponentInstance() override {
      NativeNodeApi::getInstance()->unregisterNodeEvent(m_stackNode.getArkUINodeHandle(), NODE_TOUCH_EVENT);
      ArkUINodeRegistry::getInstance().unregisterTouchHandler(&m_stackNode);
    }

    StackNode &getLocalRootArkUINode() override { return m_stackNode; };

    void onTouchEvent(ArkUI_UIInputEvent *e) override {
      auto ancestor = this->getParent().lock();
      while (ancestor != nullptr) {
        auto ancestorRNGHRootView = std::dynamic_pointer_cast<RNGestureHandlerRootViewComponentInstance>(ancestor);
        if (ancestorRNGHRootView != nullptr) {
          // If there are multiple nested GestureHandlerRootViews, the one nearest to the actual root will handle the touch.
          return;
        }
        ancestor = ancestor->getParent().lock();
      }
    
      auto ancestorTouchTarget = this->getTouchTargetParent();
      auto rnInstance = m_deps->rnInstance.lock();
      while (ancestorTouchTarget != nullptr) {
        if (ancestorTouchTarget->isHandlingTouches()) {
          rnInstance->postMessageToArkTS("RNGH::CANCEL_TOUCHES", m_tag);
          return;
        }
        ancestorTouchTarget = ancestorTouchTarget->getTouchTargetParent();
      }

      folly::dynamic payload = folly::dynamic::object;
      payload["action"] = OH_ArkUI_UIInputEvent_GetAction(e);
      folly::dynamic touchPoints = folly::dynamic::array();
      auto activeWindowX = OH_ArkUI_PointerEvent_GetWindowX(e);
      auto activeWindowY = OH_ArkUI_PointerEvent_GetWindowY(e);

      // point relative to top left corner of this component
      auto componentX = OH_ArkUI_PointerEvent_GetX(e);
      auto componentY = OH_ArkUI_PointerEvent_GetY(e);
      auto touchableViews = this->findTouchableViews(componentX, componentY);

      std::stringstream touchableViewTags;
      for (auto touchableView : touchableViews) {
        touchableViewTags << touchableView.tag << ";";
      }

      payload["touchableViews"] = this->dynamicFromTouchableViews(touchableViews);

      int32_t pointerCount = OH_ArkUI_PointerEvent_GetPointerCount(e);
      int activePointerIdx = 0;
      for (int i = 0; i < pointerCount; i++) {
        auto touchPoint = this->convertNodeTouchPointToDynamic(e, i);
        touchPoints.push_back(touchPoint);
        if (activeWindowX == touchPoint["windowX"].asDouble() && activeWindowY == touchPoint["windowY"].asDouble()) {
          activePointerIdx = i;
        }
      }
      payload["actionTouch"] = touchPoints[activePointerIdx];
      payload["touchPoints"] = touchPoints;
      payload["sourceType"] = OH_ArkUI_UIInputEvent_GetSourceType(e);
      payload["timestamp"] = OH_ArkUI_UIInputEvent_GetEventTime(e);
      payload["rootTag"] = m_tag;
      if (rnInstance) {
        rnInstance->postMessageToArkTS("RNGH::TOUCH_EVENT", payload);
      }
    }

    void setIsHandlingTouches(bool isHandlingTouches) { m_isHandlingTouches = isHandlingTouches; }

    bool isHandlingTouches() const override { return m_isHandlingTouches; }

  private:
    std::vector<TouchableView> findTouchableViews(float componentX, float componentY) {
      auto touchTarget = findTargetForTouchPoint({.x = componentX, .y = componentY}, this->shared_from_this());
      std::vector<TouchTarget::Shared> touchTargets{};
      auto tmp = touchTarget;
      while (tmp != nullptr) {
        touchTargets.push_back(tmp);
        tmp = tmp->getTouchTargetParent();
      }
      std::reverse(touchTargets.begin(), touchTargets.end()); // leaf / ... / root -> root / ... / leaf
      std::vector<TouchableView> touchableViews{};
      float offsetX = 0;
      float offsetY = 0;
      for (auto &touchTarget : touchTargets) {
        touchableViews.push_back({
          .tag = touchTarget->getTouchTargetTag(),
          .x = touchTarget->getLayoutMetrics().frame.origin.x + offsetX,
          .y = touchTarget->getLayoutMetrics().frame.origin.y + offsetY,
          .width = touchTarget->getLayoutMetrics().frame.size.width,
          .height = touchTarget->getLayoutMetrics().frame.size.height,
        });
        offsetX += touchTarget->getLayoutMetrics().frame.origin.x;
        offsetY += touchTarget->getLayoutMetrics().frame.origin.y;
        offsetX -= touchTarget->getCurrentOffset().x;
        offsetY -= touchTarget->getCurrentOffset().y;
      }

      return touchableViews;
    }

    folly::dynamic dynamicFromTouchableViews(const std::vector<TouchableView> &touchableViews) {
      folly::dynamic d_touchableViews = folly::dynamic::array();
      for (auto touchableView : touchableViews) {
        folly::dynamic d_touchableView = folly::dynamic::object;
        d_touchableView["tag"] = touchableView.tag;
        d_touchableView["x"] = touchableView.x;
        d_touchableView["y"] = touchableView.y;
        d_touchableView["width"] = touchableView.width;
        d_touchableView["height"] = touchableView.height;
        d_touchableViews.push_back(d_touchableView);
      }
      return d_touchableViews;
    }

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
#pragma once
#import "RNOH/CppComponentInstance.h"
#import "RNOH/arkui/StackNode.h"
#import "RNOH/arkui/ArkUINodeRegistry.h"
#import "RNOH/arkui/NativeNodeApi.h"
#import "RNOH/RNInstanceCAPI.h"
#import "generated/RNGestureHandlerRootViewComponentDescriptor.h"
#import "RNGestureHandlerButtonComponentInstance.h"

namespace rnoh {
class RNGestureHandlerRootViewComponentInstance
    : public CppComponentInstance<facebook::react::RNGestureHandlerRootViewShadowNode>,
      public TouchEventHandler {
  using Point = facebook::react::Point;

  enum class ActionType {
    Cancel,
    Down,
    Move,
    Up
  };

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
    bool buttonRole;
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
        // If there are multiple nested GestureHandlerRootViews, the one nearest to the actual root will handle the
        // touch.
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
    folly::dynamic touchPoints = folly::dynamic::array();
    std::vector<TouchableView> touchableViews;

    auto action = OH_ArkUI_UIInputEvent_GetAction(e);
    auto actionType = static_cast<ActionType>(action);    

    if (actionType != ActionType::Move) {
      // point relative to top left corner of this component
      auto componentX = OH_ArkUI_PointerEvent_GetX(e);
      auto componentY = OH_ArkUI_PointerEvent_GetY(e);
      touchableViews = this->findTouchableViews(componentX, componentY);
    }

    auto activeWindowX = OH_ArkUI_PointerEvent_GetWindowX(e);
    auto activeWindowY = OH_ArkUI_PointerEvent_GetWindowY(e);
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
    payload["touchableViews"] = this->dynamicFromTouchableViews(touchableViews);
    payload["rootTag"] = m_tag;
    payload["action"] = action;
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
    auto surface = this->getSurface().lock();
    if (surface != nullptr) {
      offsetX = surface->getLayoutContext().viewportOffset.x;
      offsetY = surface->getLayoutContext().viewportOffset.y;
    } else {
      LOG(WARNING) << "Surface is nullptr";
    }
    for (auto &touchTarget : touchTargets) {
      auto buttonRole = dynamic_cast<RNGestureHandlerButtonComponentInstance*>(touchTarget.get()) != nullptr;           
      auto frame = touchTarget->getLayoutMetrics().frame;
      auto transform = touchTarget->getTransform();
      auto transformedFrame = frame * transform;
      touchableViews.push_back({
        .tag = touchTarget->getTouchTargetTag(),
        .width = transformedFrame.size.width,
        .height = transformedFrame.size.height,
        .x = transformedFrame.origin.x + offsetX,
        .y = transformedFrame.origin.y + offsetY,
        .buttonRole = buttonRole,
      });
      offsetX += transformedFrame.origin.x;
      offsetY += transformedFrame.origin.y;
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
      d_touchableView["buttonRole"] = touchableView.buttonRole;
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

private:
  Surface::Weak m_surface;

  Surface::Weak getSurface() {
    if (m_surface.lock() != nullptr) {
      return m_surface;
    }
    auto rnInstance = m_deps->rnInstance.lock();
    if (rnInstance == nullptr) {
      m_surface.reset();
      return m_surface;
    }
    ComponentInstance::Shared currentRoot = shared_from_this();
    while (true) {
      auto maybeNewCurrentRoot = currentRoot->getParent().lock();
      if (maybeNewCurrentRoot == nullptr) {
        break;
      }
      currentRoot = maybeNewCurrentRoot;
    }
    auto maybeSurface = rnInstance->getSurfaceByRootTag(currentRoot->getTag());
    if (!maybeSurface.has_value()) {
      m_surface.reset();
      return m_surface;
    }
    m_surface = maybeSurface.value();
    return m_surface;
  }
};
} // namespace rnoh
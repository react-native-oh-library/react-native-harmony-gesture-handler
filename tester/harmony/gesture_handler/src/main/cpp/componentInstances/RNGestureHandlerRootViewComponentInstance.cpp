#include "RNGestureHandlerRootViewComponentInstance.h"

namespace rnoh {

RNGestureHandlerRootViewComponentInstance::RNGestureHandlerRootViewComponentInstance(Context context)
    : CppComponentInstance(std::move(context)),
      m_touchHandler(std::make_unique<RNGestureHandlerRootViewTouchHandler>(this)) {
    auto rnInstance = m_deps->rnInstance.lock();
    if (rnInstance) {
        rnInstance->postMessageToArkTS("RNGH::ROOT_CREATED", m_tag);
    }
}

RNGestureHandlerRootViewComponentInstance::RNGestureHandlerRootViewTouchHandler::RNGestureHandlerRootViewTouchHandler(
    RNGestureHandlerRootViewComponentInstance *rootView)
    : UIInputEventHandler(rootView->getLocalRootArkUINode()), m_rootView(rootView) {}

TouchTarget::Shared
RNGestureHandlerRootViewComponentInstance::findTargetForTouchPoint(Point const &point,
                                                                   TouchTarget::Shared const &target) {
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

void RNGestureHandlerRootViewComponentInstance::RNGestureHandlerRootViewTouchHandler::enable() {
  m_isEnabled = true;  
}

void RNGestureHandlerRootViewComponentInstance::RNGestureHandlerRootViewTouchHandler::disable() {
  m_isEnabled = false;
}

void RNGestureHandlerRootViewComponentInstance::RNGestureHandlerRootViewTouchHandler::onTouchEvent(
    ArkUI_UIInputEvent *e) {
    if (!m_isEnabled) {
      if (auto rnInstance = m_rootView->m_deps->rnInstance.lock()) {
        rnInstance->postMessageToArkTS("RNGH::CANCEL_TOUCHES", m_rootView->getTag());
      }  
      return;  
    }
    auto eventTime = OH_ArkUI_UIInputEvent_GetEventTime(e);
    if (eventTime < lastEventTime) {
        return;
    }
    lastEventTime = eventTime;
    auto ancestor = m_rootView->getParent().lock();
    while (ancestor != nullptr) {
        auto ancestorRNGHRootView = std::dynamic_pointer_cast<RNGestureHandlerRootViewComponentInstance>(ancestor);
        if (ancestorRNGHRootView != nullptr) {
            return;
        }
        ancestor = ancestor->getParent().lock();
    }

    auto ancestorTouchTarget = m_rootView->getTouchTargetParent();
    auto rnInstance = m_rootView->m_deps->rnInstance.lock();
    while (ancestorTouchTarget != nullptr) {
        if (ancestorTouchTarget->isHandlingTouches()) {
            rnInstance->postMessageToArkTS("RNGH::CANCEL_TOUCHES", m_rootView->getTag());
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
        auto componentX = OH_ArkUI_PointerEvent_GetX(e);
        auto componentY = OH_ArkUI_PointerEvent_GetY(e);
        touchableViews = m_rootView->findTouchableViews(componentX, componentY);
    }

    auto activeWindowX = OH_ArkUI_PointerEvent_GetWindowX(e);
    auto activeWindowY = OH_ArkUI_PointerEvent_GetWindowY(e);
    int32_t pointerCount = OH_ArkUI_PointerEvent_GetPointerCount(e);
    double minDist = -1;
    int activePointerIdx = 0;
    for (int i = 0; i < pointerCount; i++) {
        auto touchPoint = m_rootView->convertNodeTouchPointToDynamic(e, i);
        touchPoints.push_back(touchPoint);
        auto dist = pow(activeWindowX - touchPoint["windowX"].asDouble(), 2) +
                    pow(activeWindowY - touchPoint["windowY"].asDouble(), 2);
        if (minDist < 0 || dist < minDist) {
            minDist = dist;
            activePointerIdx = i;
        }
    }
    payload["actionTouch"] = touchPoints[activePointerIdx];
    payload["touchPoints"] = touchPoints;
    payload["sourceType"] = OH_ArkUI_UIInputEvent_GetSourceType(e);
    payload["timestamp"] = eventTime;
    payload["touchableViews"] = m_rootView->dynamicFromTouchableViews(touchableViews);
    payload["rootTag"] = m_rootView->getTag();
    payload["action"] = action;
    if (rnInstance) {
        rnInstance->postMessageToArkTS("RNGH::TOUCH_EVENT", payload);
    }
}

StackNode &RNGestureHandlerRootViewComponentInstance::getLocalRootArkUINode() { return m_stackNode; }

void RNGestureHandlerRootViewComponentInstance::setIsHandlingTouches(bool isHandlingTouches) {
    m_isHandlingTouches = isHandlingTouches;
}

bool RNGestureHandlerRootViewComponentInstance::isHandlingTouches() const { return m_isHandlingTouches; }

void RNGestureHandlerRootViewComponentInstance::onChildInserted(ComponentInstance::Shared const &childComponentInstance,
                                                                std::size_t index) {
    CppComponentInstance::onChildInserted(childComponentInstance, index);
    m_stackNode.insertChild(childComponentInstance->getLocalRootArkUINode(), index);
}

void RNGestureHandlerRootViewComponentInstance::onChildRemoved(
    ComponentInstance::Shared const &childComponentInstance) {
    CppComponentInstance::onChildRemoved(childComponentInstance);
    m_stackNode.removeChild(childComponentInstance->getLocalRootArkUINode());
}

std::deque<TouchTarget::Shared>
RNGestureHandlerRootViewComponentInstance::buildHierarchy(TouchTarget::Shared const &touchTarget) const {
    std::deque<TouchTarget::Shared> touchTargets{};
    auto current = touchTarget;
    while (current != nullptr) {
        touchTargets.push_front(current);
        current = current->getTouchTargetParent();
    }
    return touchTargets;
}

facebook::react::Transform RNGestureHandlerRootViewComponentInstance::getInitialTransform() {
    if (auto surface = this->getSurface().lock()) {
        const auto &viewportOffset = surface->getLayoutContext().viewportOffset;
        return facebook::react::Transform::Translate(viewportOffset.x, viewportOffset.y, 0);
    }

    LOG(WARNING) << "RNGH::Surface unavailable, using identity transform";
    return facebook::react::Transform::Identity();
}

RNGestureHandlerRootViewComponentInstance::TouchableView
RNGestureHandlerRootViewComponentInstance::createTouchableView(const TouchTarget::Shared &node,
                                                               const facebook::react::Rect &screenBounds) const {
    const bool buttonRole = dynamic_cast<RNGestureHandlerButtonComponentInstance *>(node.get()) != nullptr;

    return RNGestureHandlerRootViewComponentInstance::TouchableView{
        .tag = node->getTouchTargetTag(),
        .width = screenBounds.size.width,
        .height = screenBounds.size.height,
        .x = screenBounds.origin.x,
        .y = screenBounds.origin.y,
        .buttonRole = buttonRole,
    };
}

facebook::react::Transform
RNGestureHandlerRootViewComponentInstance::buildNodeTransform(const TouchTarget::Shared &node)  const {
    const auto frame = node->getLayoutMetrics().frame;
    auto currentOffset = node->getCurrentOffset();
    const auto nodeTransform = node->getTransform();

    // For inverted lists, the scroll offset needs to be applied in the opposite direction
    if (facebook::react::Transform::isVerticalInversion(nodeTransform)) {
        currentOffset.y = -currentOffset.y;
    }

    if (facebook::react::Transform::isHorizontalInversion(nodeTransform)) {
        currentOffset.x = -currentOffset.x;
    }

    const auto frameCenter = facebook::react::Point{frame.size.width * 0.5f, frame.size.height * 0.5f};

    // First, position the view at its layout origin (frame.origin - currentOffset).
    // Then apply its local transform around the view's center:
    // translate to center -> nodeTransform -> translate back.
    return facebook::react::Transform::Translate(frame.origin.x - currentOffset.x, frame.origin.y - currentOffset.y,
                                                 0) *
           facebook::react::Transform::Translate(frameCenter.x, frameCenter.y, 0) * nodeTransform *
           facebook::react::Transform::Translate(-frameCenter.x, -frameCenter.y, 0);
}
void RNGestureHandlerRootViewComponentInstance::onNativeResponderBlockChange(bool isBlocked) {
    /**
     * Both, React Native and RNGH can block native responder. However, RNGH doesn't block RNGestureHandlerRootView
     * (and its ancestors), so this method is called only when React Native blocks a native responder.
     */
      if (isBlocked) {
        m_touchHandler->disable();
        if (auto rnInstance = m_deps->rnInstance.lock()) {
          rnInstance->postMessageToArkTS("RNGH::CANCEL_TOUCHES", m_tag);      
        }
      } else {
        m_touchHandler->enable();
      }    
  }
  

std::vector<RNGestureHandlerRootViewComponentInstance::TouchableView>
RNGestureHandlerRootViewComponentInstance::findTouchableViews(float componentX, float componentY) {
    auto touchTarget = findTargetForTouchPoint({.x = componentX, .y = componentY}, this->shared_from_this());
    if (touchTarget == nullptr) {
        return {};
    }
    // Build hierarchy from root to touchTarget
    auto touchTargets = buildHierarchy(touchTarget);

    std::vector<TouchableView> touchableViews{};
    touchableViews.reserve(touchTargets.size());

    auto cumulativeTransform = getInitialTransform();

    // It calculates the cumulative transform for each view in the hierarchy to map its
    // bounding box to screen coordinates
    for (const auto &node : touchTargets) {
        const auto frame = node->getLayoutMetrics().frame;

        cumulativeTransform = cumulativeTransform * buildNodeTransform(node);

        // Map this node's local corners to screen space
        const auto a = facebook::react::Point{0.0f, 0.0f} * cumulativeTransform;
        const auto b = facebook::react::Point{frame.size.width, 0.0f} * cumulativeTransform;
        const auto c = facebook::react::Point{frame.size.width, frame.size.height} * cumulativeTransform;
        const auto d = facebook::react::Point{0.0f, frame.size.height} * cumulativeTransform;

        const auto boundingRect = facebook::react::Rect::boundingRect(a, b, c, d);

        touchableViews.push_back(createTouchableView(node, boundingRect));
    }

    return touchableViews;
}

folly::dynamic
RNGestureHandlerRootViewComponentInstance::dynamicFromTouchableViews(const std::vector<TouchableView> &touchableViews) {
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

folly::dynamic RNGestureHandlerRootViewComponentInstance::convertNodeTouchPointToDynamic(ArkUI_UIInputEvent *e,
                                                                                         int32_t index) {
    folly::dynamic result = folly::dynamic::object;
    result["pointerId"] = OH_ArkUI_PointerEvent_GetPointerId(e, index);
    result["windowX"] = OH_ArkUI_PointerEvent_GetWindowXByIndex(e, index);
    result["windowY"] = OH_ArkUI_PointerEvent_GetWindowYByIndex(e, index);
    return result;
}

Surface::Weak RNGestureHandlerRootViewComponentInstance::getSurface() {
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

} // namespace rnoh

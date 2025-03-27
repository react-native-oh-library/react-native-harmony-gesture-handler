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

void RNGestureHandlerRootViewComponentInstance::RNGestureHandlerRootViewTouchHandler::onTouchEvent(
    ArkUI_UIInputEvent *e) {
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

std::vector<RNGestureHandlerRootViewComponentInstance::TouchableView>
RNGestureHandlerRootViewComponentInstance::findTouchableViews(float componentX, float componentY) {
    auto touchTarget = findTargetForTouchPoint({.x = componentX, .y = componentY}, this->shared_from_this());
    std::vector<TouchTarget::Shared> touchTargets{};
    auto tmp = touchTarget;
    while (tmp != nullptr) {
        touchTargets.push_back(tmp);
        tmp = tmp->getTouchTargetParent();
    }
    std::reverse(touchTargets.begin(), touchTargets.end());

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
        auto buttonRole = dynamic_cast<RNGestureHandlerButtonComponentInstance *>(touchTarget.get()) != nullptr;
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

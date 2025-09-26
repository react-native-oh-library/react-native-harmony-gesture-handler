#pragma once
#include "RNOH/CppComponentInstance.h"
#include "RNOH/arkui/StackNode.h"
#include "RNOH/arkui/NativeNodeApi.h"
#include "RNOH/arkui/UIInputEventHandler.h"
#include "RNOH/RNInstanceCAPI.h"
#include "generated/RNGestureHandlerRootViewComponentDescriptor.h"
#include "RNGestureHandlerButtonComponentInstance.h"

namespace rnoh {
class RNGestureHandlerRootViewComponentInstance
    : public CppComponentInstance<facebook::react::RNGestureHandlerRootViewShadowNode> {
public:
    class RNGestureHandlerRootViewTouchHandler : public UIInputEventHandler {
    public:
        RNGestureHandlerRootViewTouchHandler(RNGestureHandlerRootViewComponentInstance const &other) = delete;
        RNGestureHandlerRootViewTouchHandler &
        operator=(RNGestureHandlerRootViewComponentInstance const &other) = delete;
        RNGestureHandlerRootViewTouchHandler(RNGestureHandlerRootViewComponentInstance &&other) = delete;
        RNGestureHandlerRootViewTouchHandler &operator=(RNGestureHandlerRootViewComponentInstance &&other) = delete;
        explicit RNGestureHandlerRootViewTouchHandler(RNGestureHandlerRootViewComponentInstance *rootView);

        void onTouchEvent(ArkUI_UIInputEvent *e) override;

    private:
        RNGestureHandlerRootViewComponentInstance *m_rootView;
        int64_t lastEventTime = 0;
    };

    using Point = facebook::react::Point;
    enum class ActionType { CANCEL, DOWN, MOVE, UP };

    explicit RNGestureHandlerRootViewComponentInstance(Context context);

    StackNode &getLocalRootArkUINode() override;
    void SetIsHandlingTouches(bool isHandlingTouches);
    bool IsHandlingTouches() const override;

    // This function is borrowed from TouchEventDispatcher
    TouchTarget::Shared findTargetForTouchPoint(Point const &point, TouchTarget::Shared const &target);

protected:
    void onChildInserted(ComponentInstance::Shared const &childComponentInstance, std::size_t index) override;
    void onChildRemoved(ComponentInstance::Shared const &childComponentInstance) override;

private:
    struct TouchableView {
        Tag tag;
        facebook::react::Float width;
        facebook::react::Float height;
        facebook::react::Float x;
        facebook::react::Float y;
        bool buttonRole;
    };

    bool m_isHandlingTouches = false;
    StackNode m_stackNode;
    Surface::Weak m_surface;
    std::unique_ptr<UIInputEventHandler> m_touchHandler;

    std::vector<TouchableView> findTouchableViews(float componentX, float componentY);
    folly::dynamic dynamicFromTouchableViews(const std::vector<TouchableView> &touchableViews);
    folly::dynamic convertNodeTouchPointToDynamic(ArkUI_UIInputEvent *e, int32_t index = 0);
    Surface::Weak getSurface();
};
} // namespace rnoh
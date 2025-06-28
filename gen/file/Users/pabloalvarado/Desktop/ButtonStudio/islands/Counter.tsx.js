import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { Button } from "../components/Button.tsx";
export default function Counter(props) {
  return /*#__PURE__*/ _jsxs("div", {
    class: "flex gap-8 py-6",
    children: [
      /*#__PURE__*/ _jsx(Button, {
        onClick: ()=>props.count.value -= 1,
        children: "-1"
      }),
      /*#__PURE__*/ _jsx("p", {
        class: "text-3xl tabular-nums",
        children: props.count
      }),
      /*#__PURE__*/ _jsx(Button, {
        onClick: ()=>props.count.value += 1,
        children: "+1"
      })
    ]
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vVXNlcnMvcGFibG9hbHZhcmFkby9EZXNrdG9wL0J1dHRvblN0dWRpby9pc2xhbmRzL0NvdW50ZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgU2lnbmFsIH0gZnJvbSBcIkBwcmVhY3Qvc2lnbmFsc1wiO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvQnV0dG9uLnRzeFwiO1xuXG5pbnRlcmZhY2UgQ291bnRlclByb3BzIHtcbiAgY291bnQ6IFNpZ25hbDxudW1iZXI+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb3VudGVyKHByb3BzOiBDb3VudGVyUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBnYXAtOCBweS02XCI+XG4gICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHByb3BzLmNvdW50LnZhbHVlIC09IDF9Pi0xPC9CdXR0b24+XG4gICAgICA8cCBjbGFzcz1cInRleHQtM3hsIHRhYnVsYXItbnVtc1wiPntwcm9wcy5jb3VudH08L3A+XG4gICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHByb3BzLmNvdW50LnZhbHVlICs9IDF9PisxPC9CdXR0b24+XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFNBQVMsTUFBTSxRQUFRLDJCQUEyQjtBQU1sRCxlQUFlLFNBQVMsUUFBUSxLQUFtQjtFQUNqRCxxQkFDRSxNQUFDO0lBQUksT0FBTTs7b0JBQ1QsS0FBQztRQUFPLFNBQVMsSUFBTSxNQUFNLEtBQUssQ0FBQyxLQUFLLElBQUk7a0JBQUc7O29CQUMvQyxLQUFDO1FBQUUsT0FBTTtrQkFBeUIsTUFBTSxLQUFLOztvQkFDN0MsS0FBQztRQUFPLFNBQVMsSUFBTSxNQUFNLEtBQUssQ0FBQyxLQUFLLElBQUk7a0JBQUc7Ozs7QUFHckQifQ==
// denoCacheMetadata=11700598251390268495,12770490920466416945
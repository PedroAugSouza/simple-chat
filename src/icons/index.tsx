import {
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
  SVGAttributes,
} from "react";

type Props = SVGAttributes<SVGSVGElement>;
type Ref = SVGElement;

export const AnthropicIcon = forwardRef<Ref, Props>(
  ({ color, strokeWidth, ...props }, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        height={24}
        width={24}
        {...props}
      >
        <path
          fill={color ?? "#000"}
          d="M13.789 3.932l6.433 16.136h3.528L17.317 3.932h-3.528zM6.325 13.683l2.202-5.67 2.2 5.67H6.326zm.357-9.751L.25 20.068h3.597l1.315-3.389h6.73l1.315 3.39h3.596L10.371 3.931H6.682z"
          strokeWidth={strokeWidth ?? 0.25}
        />
      </svg>
    );
  }
);

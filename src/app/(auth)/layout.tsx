"use client";
import PixelBlast from "@/components/PixelBlast";
import { ReactNode } from "react";

export default ({ children }: { children: ReactNode }) => {
  return (
    <main className="h-screen w-screen grid place-items-center relative">
      <div style={{ width: "100%", height: "100%", position: "absolute" }}>
        <PixelBlast
          variant="square"
          pixelSize={3}
          patternScale={2}
          patternDensity={1.4}
          pixelSizeJitter={1.55}
          edgeFade={0.05}
          speed={1}
          color="#000"
          enableRipples
          rippleSpeed={0.1}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          transparent
        />
      </div>
      <div className="z-10">{children}</div>
    </main>
  );
};

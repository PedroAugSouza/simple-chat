"use client";
import PixelBlast from "@/components/PixelBlast";
import { motion } from "motion/react";
import { ReactNode } from "react";

export default ({ children }: { children: ReactNode }) => {
  return (
    <main className="h-screen w-screen grid place-items-center relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="size-full absolute"
      >
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
      </motion.div>
      <div className="z-10">{children}</div>
    </main>
  );
};

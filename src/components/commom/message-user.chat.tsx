import { format } from "date-fns";

import { Markdown } from "./markdown";
import { User } from "lucide-react";
import { motion } from "motion/react";
import { MyUIMessage } from "@/types";

export const MessageUser = ({ id, role, parts, ...message }: MyUIMessage) => {
  return (
    <motion.div
      key={id}
      layout="position"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full flex justify-end"
    >
      <div className="items-end flex flex-col gap-1 ">
        <div className="items-center flex flex-row gap-1 text-xs font-mono">
          <span>Você</span>
          <span className="size-1 bg-black" />
          <span>
            {format(message.metadata?.createdAt ?? new Date(), "HH:mm")}
          </span>
        </div>
        <div className="py-2 px-3 bg-gray-200 rounded-lg font-sans rounded-tr-none">
          {parts.map((part, i) => {
            switch (part.type) {
              case "text":
                return <Markdown key={`${id}-${i}-text`}>{part.text}</Markdown>;
            }
          })}
        </div>
      </div>
      <div className="border size-8 ml-2 grid place-items-center border-gray-300 rounded">
        <User size={18} />
      </div>
    </motion.div>
  );
};

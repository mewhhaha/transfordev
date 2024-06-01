import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const cx = (...parameters: Parameters<typeof clsx>) => {
  return twMerge(clsx(...parameters));
};

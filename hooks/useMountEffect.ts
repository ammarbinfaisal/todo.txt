import { useEffect } from "react";

/** Runs callback once on mount. The only sanctioned useEffect wrapper. */
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (callback: () => void | (() => void)) => useEffect(callback, []);

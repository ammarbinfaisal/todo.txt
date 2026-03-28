function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/** Light tick — swipe checkpoint, row boundary crossing */
export function tick() {
  vibrate(10);
}

/** Medium bump — toggle complete, action confirm */
export function bump() {
  vibrate(25);
}

/** Strong pulse — drag start, delete confirm */
export function heavy() {
  vibrate([15, 30, 15]);
}

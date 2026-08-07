// useTiltGesture.ts
import { useState, useEffect, useRef } from "react";
import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes,
} from "react-native-sensors";

export type TiltGesture = "NEUTRAL" | "TILT_UP" | "TILT_DOWN";

const TILT_THRESHOLD = 0.5;
const NEUTRAL_THRESHOLD = 0.2;
const DEBOUNCE_MS = 300;

setUpdateIntervalForType(SensorTypes.accelerometer, 100);

export function useTiltGesture(onGesture?: (gesture: TiltGesture) => void) {
  const [gesture, setGesture] = useState<TiltGesture>("NEUTRAL");

  const isLockedRef = useRef(false);
  const lastTriggerRef = useRef(0);
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  useEffect(() => {
    const subscription = accelerometer.subscribe(({ x }) => {
      const now = Date.now();

      if (isLockedRef.current) {
        if (Math.abs(x) < NEUTRAL_THRESHOLD) {
          isLockedRef.current = false;
          setGesture("NEUTRAL");
        }
        return;
      }

      if (now - lastTriggerRef.current < DEBOUNCE_MS) return;

      if (x > TILT_THRESHOLD) {
        lastTriggerRef.current = now;
        isLockedRef.current = true;
        setGesture("TILT_DOWN");
        onGestureRef.current?.("TILT_DOWN");
      } else if (x < -TILT_THRESHOLD) {
        lastTriggerRef.current = now;
        isLockedRef.current = true;
        setGesture("TILT_UP");
        onGestureRef.current?.("TILT_UP");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return gesture;
}

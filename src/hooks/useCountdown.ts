// useCountdown.ts
import { useState, useRef, useCallback, useEffect } from "react";

export function useCountdown(initialSeconds: number, onFinish?: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish; // always latest callback, no stale closure

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        clear();
        setIsRunning(false);
        onFinishRef.current?.();
        return 0;
      }
      return prev - 1;
    });
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return; // already running
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    start();
  }, [start]);

  const reset = useCallback(
    (newSeconds: number = initialSeconds) => {
      clear();
      setIsRunning(false);
      setRemaining(newSeconds);
    },
    [initialSeconds],
  );

  useEffect(() => clear, []); // cleanup on unmount

  return { remaining, isRunning, start, pause, resume, reset };
}

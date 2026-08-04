import { useEffect, useState } from "react";
import { Text } from "react-native";

type GameTimerProps = {
  duration: number;
  onComplete: () => void;
};

export default function GameTimer({ duration, onComplete }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return <Text>{timeLeft}s</Text>;
}

import { useState, useEffect } from "react";
import Orientation from "react-native-orientation-locker";

export type OrientationType = "Portrait" | "LandscapeLeft" | "LandscapeRight";

function mapOrientation(o: string): OrientationType {
  if (o === "LANDSCAPE-LEFT") return "LandscapeLeft";
  if (o === "LANDSCAPE-RIGHT") return "LandscapeRight";
  return "Portrait"; // covers PORTRAIT, PORTRAIT-UPSIDEDOWN, UNKNOWN
}

export function useOrientation(): OrientationType {
  const [orientation, setOrientation] = useState<OrientationType>(() =>
    mapOrientation(Orientation.getInitialOrientation()),
  );

  useEffect(() => {
    const handler = (o: string) => setOrientation(mapOrientation(o));

    Orientation.addOrientationListener(handler);
    return () => Orientation.removeOrientationListener(handler);
  }, []);

  return orientation;
}

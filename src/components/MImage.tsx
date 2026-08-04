import React from "react";
import { StyleProp, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface MImageProps {
  data: {
    name: keyof typeof Ionicons.glyphMap;
    size?: number;
    color?: string;
    imageStyle?: StyleProp<any>;
  };
  style?: StyleProp<any>;
}

export default function MImage({ data, style }: MImageProps) {
  const { name, size, color, imageStyle } = data;
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={name} size={size} color={color} style={imageStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

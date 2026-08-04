import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FooterData {
  left?: { text: string; onPress: () => void };
  center?: { text: string; onPress: () => void };
  right?: { text: string; onPress: () => void };
  customComponent?: React.ReactNode;
  stylesObject?: {
    container?: ViewStyle;
    button?: ViewStyle;
    text?: TextStyle;
  };
}

interface FooterProps {
  data?: FooterData;
  style?: ViewStyle;
}

export default function Footer({ data, style }: FooterProps) {
  const { left, center, right, customComponent, stylesObject } = data || {};
  return (
    <SafeAreaView edges={["bottom"]} style={[styles.container, style]}>
      {customComponent ? (
        customComponent
      ) : (
        <>
          {left && (
            <Pressable
              style={[styles.button, stylesObject?.button]}
              onPress={left.onPress}
            >
              <Text style={[styles.text, stylesObject?.text]}>{left.text}</Text>
            </Pressable>
          )}

          {center && (
            <Pressable
              style={[styles.button, stylesObject?.button]}
              onPress={center.onPress}
            >
              <Text style={[styles.text, stylesObject?.text]}>
                {center.text}
              </Text>
            </Pressable>
          )}

          {right && (
            <Pressable
              style={[styles.button, stylesObject?.button]}
              onPress={right.onPress}
            >
              <Text style={[styles.text, stylesObject?.text]}>
                {right.text}
              </Text>
            </Pressable>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1e293b",
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  button: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#22c55e",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

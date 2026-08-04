import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MImage, { MImageProps } from "./MImage";

interface HeaderData {
  title?: string;
  back?: {
    onPress?: () => void;
    icon?: MImageProps;
    text?: string;
  };
  customComponent?: React.ReactNode;
  stylesObject?: {
    container?: ViewStyle;
    title?: TextStyle;
    backButton?: ViewStyle;
    backText?: TextStyle;
  };
}

interface HeaderProps {
  data?: HeaderData;
  style?: ViewStyle;
}

export default function Header({ data, style }: HeaderProps) {
  const { title = "Header", back, customComponent, stylesObject } = data || {};
  const navigation = useNavigation();

  const DEFAULT_BACK_ICON: MImageProps = {
    data: {
      name: "arrow-back",
      size: 24,
      color: "#60a5fa",
    },
  };

  const resolvedBackIcon = back?.icon ?? DEFAULT_BACK_ICON;
  const resolvedBackText = back?.text ?? "Back";

  const handleBack = () => {
    if (back?.onPress) {
      back.onPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      alert("No back action available");
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, stylesObject?.container, style]}
    >
      {customComponent ? (
        customComponent
      ) : (
        <>
          <Pressable
            style={[styles.backButton, stylesObject?.backButton]}
            onPress={handleBack}
          >
            <MImage {...resolvedBackIcon} />
            <Text style={[styles.backText, stylesObject?.backText]}>
              {resolvedBackText}
            </Text>
          </Pressable>

          <Text style={[styles.title, stylesObject?.title]}>{title}</Text>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  backText: {
    marginLeft: 6,
    color: "#60a5fa",
    fontSize: 16,
  },
  title: {
    flex: 1,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

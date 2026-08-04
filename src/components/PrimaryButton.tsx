import { Pressable, Text, StyleSheet } from "react-native";
import commonStyles from "../constants/commonStyles";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: object;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      style={[styles.button, style, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    ...commonStyles.button,
    width: "80%",
    marginVertical: 10,
  },
  text: {
    ...commonStyles.subtitle,
    textAlign: "center",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import MImage from "./MImage";

interface InputModalProps {
  visible: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

export default function InputModal({
  visible,
  title,
  initialValue,
  placeholder,
  onSave,
  onClose,
}: InputModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [visible]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <View style={styles.modalContainer}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MImage
                data={{
                  name: "close",
                  size: 24,
                  color: "#666",
                }}
              />
            </Pressable>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                value={value}
                onChangeText={setValue}
                autoFocus
                placeholder={placeholder ? placeholder : ""}
                onSubmitEditing={handleSave}
              />
              {value.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setValue("")}
                >
                  <MImage
                    data={{
                      name: "close-circle",
                      size: 23,
                      color: "#999",
                    }}
                  />
                </Pressable>
              )}
            </View>
            <Pressable style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    margin: 30,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    position: "relative",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
    marginBottom: 20,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: 10,
  },
  modalButton: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

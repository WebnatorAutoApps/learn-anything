import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  className?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={`border border-theme-border bg-theme-surface text-theme-secondary rounded-lg px-3 py-2.5 text-sm ${className}`}
        placeholderTextColor="#6b7280"
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;

interface TextAreaProps extends TextInputProps {
  className?: string;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        multiline
        className={`border border-theme-border bg-theme-surface text-theme-secondary rounded-lg px-3 py-2.5 text-sm ${className}`}
        placeholderTextColor="#6b7280"
        style={{ textAlignVertical: "top" }}
        {...props}
      />
    );
  }
);

TextArea.displayName = "TextArea";

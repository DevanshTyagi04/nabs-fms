import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { Input, InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'secureTextEntry' | 'rightIcon' | 'onRightIconClick'>;

export const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
  ({ leftIcon = 'lock', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        secureTextEntry={!showPassword}
        leftIcon={leftIcon}
        rightIcon={showPassword ? 'eye-off' : 'eye'}
        onRightIconClick={() => setShowPassword(!showPassword)}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

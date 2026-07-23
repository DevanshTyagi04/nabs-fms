'use client';

import React, { useState } from 'react';
import { Input, InputProps } from './Input';

export type PasswordInputProps = Omit<InputProps, 'type' | 'rightIcon' | 'onRightIconClick'>;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ leftIcon = 'lock', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        leftIcon={leftIcon}
        rightIcon={showPassword ? 'eye-off' : 'eye'}
        onRightIconClick={() => setShowPassword(!showPassword)}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/schemas/auth.schema';
import { useAuth } from './auth-provider';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/lib/types/auth.types';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const { ref: registerEmailRef, ...emailRegisterRest } = register('email');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Autofocus email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      await login(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      setIsSubmitting(false);

      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        if (Array.isArray(errorData.message)) {
          setServerError(errorData.message.join('. '));
        } else if (typeof errorData.message === 'string') {
          setServerError(errorData.message);
        } else {
          setServerError('Authentication failed. Please check your credentials.');
        }
      } else if (err instanceof AxiosError && (err.message === 'Network Error' || err.code === 'ERR_NETWORK')) {
        setServerError('Unable to connect to the authentication server. Please check your internet connection.');
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-studio">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-600 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-[16px] md:p-[32px]">
      {/* Authentication Card Container */}
      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="font-semibold text-[24px] leading-[32px] text-[#0b1c30] tracking-tight">
            Login To Admin Dashboard
          </h1>
          <p className="text-[14px] leading-[20px] text-[#45464d] opacity-80 mt-1">
            Authenticate to access the NABS FSM Admin Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-[#c6c6cd] p-[32px] rounded-lg shadow-sm relative overflow-hidden">
          {/* Visual integrity indicator (Subtle corner accent) */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none secure-texture opacity-50"></div>

          {/* Backend Error Alert Banner */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start space-x-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input Group */}
            <div className="space-y-1">
              <label
                className="block text-[12px] leading-[16px] font-semibold text-[#0b1c30] uppercase"
                htmlFor="email"
              >
                EMAIL ADDRESS
              </label>
              <div className="relative flex items-center">
                <input
                  id="email"
                  type="email"
                  placeholder="email"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-4 py-3 bg-[#f8f9ff] border ${
                    errors.email ? 'border-red-500 focus:ring-red-200' : 'border-[#c6c6cd] focus:border-[#006591] focus:ring-[#006591]/20'
                  } rounded-lg transition-all outline-none text-[14px] leading-[20px] disabled:opacity-50`}
                  {...emailRegisterRest}
                  ref={(e) => {
                    registerEmailRef(e);
                    emailInputRef.current = e;
                  }}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input Group */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label
                  className="block text-[12px] leading-[16px] font-semibold text-[#0b1c30] uppercase"
                  htmlFor="password"
                >
                  PASSWORD
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-[12px] leading-[16px] font-semibold text-[#006591] hover:underline transition-all"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className={`w-full pl-4 pr-10 py-3 bg-[#f8f9ff] border ${
                    errors.password ? 'border-red-500 focus:ring-red-200' : 'border-[#c6c6cd] focus:border-[#006591] focus:ring-[#006591]/20'
                  } rounded-lg transition-all outline-none text-[14px] leading-[20px] disabled:opacity-50`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#76777d] hover:text-[#45464d] transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                disabled={isSubmitting}
                className="w-4 h-4 rounded border-[#c6c6cd] text-black focus:ring-slate-400 accent-black cursor-pointer"
                {...register('remember')}
              />
              <label
                htmlFor="remember"
                className="text-[14px] leading-[20px] text-[#45464d] cursor-pointer select-none"
              >
                Remember this device for 30 days
              </label>
            </div>

            {/* Primary Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 px-4 rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]"><ArrowRight /></span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

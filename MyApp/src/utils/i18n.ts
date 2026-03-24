// A minimal i18n dictionary for the specific screens to keep it production-safe and deterministic.
import { useState } from 'react';

type LanguageCode = 'en' | 'hi';

export const translations = {
  en: {
    loginWithPhone: "Login with OTP",
    verifyPhone: "Verify Your Phone",
    sendOtpDescLogin: "We'll send you a one-time password",
    sendOtpDescVerify: "OTP required to verify your phone number",
    phoneNumberLabel: "Phone Number",
    phonePlaceholder: "Enter 10-digit number",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    show: "Show",
    hide: "Hide",
    loginBtn: "Login",
    or: "OR",
    continueWithGoogle: "Continue with Google",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",
    sendingOtp: "Sending OTP...",
    sendOtp: "Send OTP",
    verificationTitle: "Verification!",
    verifyEmailContent: "Verify the code sent to",
    verifyPhoneContent: "Verify the code sent to +91",
    continueBtn: "Continue",
    setPasswordTitle: "Set a Password",
    setPasswordSubtitle: "Create a password for faster logins next time (optional)",
    setPasswordPlaceholder: "Enter password (min 6 chars)",
    confirmPasswordPlaceholder: "Confirm password",
    setPasswordBtn: "Set Password",
    settingPassword: "Setting password...",
    skipPassword: "Skip for now",
    invalidPhone: "Please enter a valid 10-digit phone number",
    invalidPassword: "Password must be at least 6 characters",
    passwordMismatch: "Passwords do not match",
    languageToggle: "हिंदी में बदलें (Switch to Hindi)"
  },
  hi: {
    loginWithPhone: "ओटीपी के साथ लॉगिन करें",
    verifyPhone: "अपना फ़ोन सत्यापित करें",
    sendOtpDescLogin: "हम आपको एक वन-टाइम पासवर्ड भेजेंगे",
    sendOtpDescVerify: "फ़ोन नंबर सत्यापित करने के लिए ओटीपी आवश्यक है",
    phoneNumberLabel: "फ़ोन नंबर",
    phonePlaceholder: "10-अंकीय नंबर दर्ज करें",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    show: "दिखाएं",
    hide: "छिपाएं",
    loginBtn: "लॉग इन करें",
    or: "या",
    continueWithGoogle: "Google के साथ जारी रखें",
    noAccount: "क्या आपका खाता नहीं है?",
    signUp: "साइन अप करें",
    sendingOtp: "ओटीपी भेजा जा रहा है...",
    sendOtp: "ओटीपी भेजें",
    verificationTitle: "सत्यापन!",
    verifyEmailContent: "इस ईमेल पर भेजे गए कोड की पुष्टि करें",
    verifyPhoneContent: "+91 पर भेजे गए कोड की पुष्टि करें",
    continueBtn: "जारी रखें",
    setPasswordTitle: "पासवर्ड सेट करें",
    setPasswordSubtitle: "अगली बार तेज़ी से लॉगिन करने के लिए पासवर्ड बनाएं (वैकल्पिक)",
    setPasswordPlaceholder: "पासवर्ड दर्ज करें (कम से कम 6 अक्षर)",
    confirmPasswordPlaceholder: "पासवर्ड की पुष्टि करें",
    setPasswordBtn: "पासवर्ड सेट करें",
    settingPassword: "पासवर्ड सेट किया जा रहा है...",
    skipPassword: "अभी छोड़ें",
    invalidPhone: "कृपया एक वैध 10-अंकीय फ़ोन नंबर दर्ज करें",
    invalidPassword: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए",
    passwordMismatch: "पासवर्ड मेल नहीं खाते",
    languageToggle: "Switch to English"
  }
};

let currentLanguage: LanguageCode = 'en';

export const setLanguage = (lang: LanguageCode) => {
  currentLanguage = lang;
};

export const t = (key: keyof typeof translations.en): string => {
  return translations[currentLanguage][key] || translations['en'][key];
};

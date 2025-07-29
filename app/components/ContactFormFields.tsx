import { useState } from "react";

interface ContactFormFieldsProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  emailError: string;
  setEmailError: (value: string) => void;
  phone?: string;
  setPhone?: (value: string) => void;
  phoneError?: string;
  setPhoneError?: (value: string) => void;
}

export const ContactFormFields = ({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  phoneError,
  setPhoneError,
  emailError,
  setEmailError,
}: ContactFormFieldsProps) => {
  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation function
  const validatePhone = (phone: string) => {
    const removeWhiteSpace = phone.replace(/\s/g, "");
    const isDigitsOnly = /^\d+$/.test(removeWhiteSpace);
    const digitsOnly = removeWhiteSpace.replace(/\D/g, "");
    const validLength = digitsOnly.length >= 10 && digitsOnly.length <= 15;
    return isDigitsOnly && validLength;
  };

  // Update email handler
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Enter a valid email eg. name@email.com");
    } else {
      setEmailError("");
    }
  };

  // Update phone handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    if (setPhone) {
      setPhone(newPhone);
    }

    if (newPhone && !validatePhone(newPhone) && setPhoneError) {
      setPhoneError("Enter a valid phone number eg. 778 123 4567");
    } else if (setPhoneError) {
      setPhoneError("");
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto mb-8">
      {/* Full name */}
      <div>
        <label className="block text-gray-700 mb-1 text-sm">Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
          placeholder="Enter your full name"
        />
      </div>

      {/* Phone number - only render if phone props are provided */}
      {setPhone && (
        <div>
          <label className="block text-gray-700 mb-1 text-sm">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none ${
              phoneError
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300 focus:ring-blue-300"
            }`}
            placeholder="+1 234 567 9010"
          />
          {phoneError && (
            <p className="text-xs text-red-500 mt-1">{phoneError}</p>
          )}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-gray-700 mb-1 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none ${
            emailError
              ? "border-red-500 ring-1 ring-red-500"
              : "border-gray-300 focus:ring-blue-300"
          }`}
          placeholder="example@gmail.com"
        />
        {emailError && (
          <p className="text-xs text-red-500 mt-1">{emailError}</p>
        )}
      </div>
    </div>
  );
};

import { X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ContactFormFields } from "./ContactFormFields";
import { getApiPath } from "../utils/apiPath";

interface PackageDownloadData {
  [x: string]: any;
  images: string[];
}

interface PackageDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PackageDownloadData;
}

export default function PackageDownloadModal({
  isOpen,
  onClose,
  data,
}: PackageDownloadModalProps) {
  const [isTallScreen, setIsTallScreen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"vetted" | "own">(
    "vetted"
  );
  const [newsletter, setNewsletter] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      setIsTallScreen(window.innerHeight >= 750);
    };
    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  }, []);

  const clearForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setPhoneError("");
    setEmailError("");
  };

  // Add email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

  // Add phone validation function
  const validatePhone = (phone: string) => {
    const removeWhiteSpace = phone.replace(/\s/g, "");
    const isDigitsOnly = /^\d+$/.test(removeWhiteSpace);
    const digitsOnly = removeWhiteSpace.replace(/\D/g, "");
    const validLength = digitsOnly.length >= 10 && digitsOnly.length <= 15;
    return isDigitsOnly && validLength;
  };

  // Update phone handler
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhone(newPhone);

    if (newPhone && !validatePhone(newPhone)) {
      setPhoneError("Enter a valid phone number eg. 778 123 4567");
    } else {
      setPhoneError("");
    }
  };

  // Add form validation state
  const isFormInvalid =
    isSubmitting ||
    !fullName ||
    !phone ||
    !email ||
    !!phoneError ||
    !!emailError;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      toast.loading("Sending your information...");

      const response = await fetch(getApiPath("/api/email"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          newsletter,
          selectedOption,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      toast.dismiss();
      toast.success("Information sent successfully!");
      clearForm();
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to send information. Please try again.");
    } finally {
      setIsSubmitting(false);
      clearForm();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className={`w-full max-w-[500px] mx-auto bg-white rounded-lg flex flex-col relative ${
            isTallScreen
              ? "h-auto max-h-[850px]"
              : "h-[calc(100vh-32px)] overflow-y-auto"
          }`}
        >
          <button className="absolute top-4 right-4 z-10" onClick={onClose}>
            <X className="h-6 w-6 text-gray-500" />
          </button>

          <div className="overflow-y-auto flex-1 p-6 pt-1 mt-12">
            {/* Header image */}
            <div className="mb-6 rounded-lg overflow-hidden">
              <Image
                src={data.images[0]}
                width={400}
                height={100}
                alt="Modern bathroom interior"
                className="w-full h-[100px] object-cover object-center"
              />
            </div>

            {/* Form content */}
            <h1 className="text-xl font-regular text-center mb-1">
              Get a free consult with your download
            </h1>
            <p className="text-gray-600 text-center text-sm mb-4">
              We will send your bathroom package right to your inbox
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <ContactFormFields
                fullName={fullName}
                setFullName={setFullName}
                phone={phone}
                setPhone={setPhone}
                email={email}
                setEmail={setEmail}
                phoneError={phoneError}
                setPhoneError={setPhoneError}
                emailError={emailError}
                setEmailError={setEmailError}
              />

              {/* Newsletter checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="
                    appearance-none
                    h-4 w-4
                    border border-black
                    rounded-sm
                    cursor-pointer
                    relative
                    checked:bg-white
                    checked:border-black
                    focus:outline-none
                    checked:before:content-['✔']
                    checked:before:text-black
                    checked:before:absolute
                    checked:before:inset-0
                    checked:before:flex
                    checked:before:items-center
                    checked:before:justify-center
                    checked:before:text-xs
                  "
                />
                <label className="ml-2 text-gray-600">
                  Receive the latest news on bathroom renovations
                </label>
              </div>

              {/* Contractor selection */}
              <div className="p-4 rounded-lg bg-[#F6F7F9]">
                <h2 className="text-base text-center mb-4">
                  Do you want to receive an accurate quote from a contractor?
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedOption("vetted")}
                    className={`p-3 border rounded-lg flex flex-col items-center text-center transition-colors
                      ${
                        selectedOption === "vetted"
                          ? "border-[#8DBACE] shadow-md"
                          : "hover:bg-gray-50"
                      }
                    `}
                  >
                    <Image
                      src="/icons/download/contractor.png"
                      alt="Contractor"
                      width={24}
                      height={24}
                      className="mb-2"
                    />
                    <span className="leading-tight">
                      Yes, connect me with a vetted contractor
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOption("own")}
                    className={`p-3 border rounded-lg flex flex-col items-center text-center transition-colors
                      ${
                        selectedOption === "own"
                          ? "border-[#8DBACE] shadow-md"
                          : "hover:bg-gray-50"
                      }
                    `}
                  >
                    <Image
                      src="/icons/download/contractors.png"
                      alt="Own"
                      width={24}
                      height={24}
                      className="mb-2"
                    />
                    <span className="leading-tight">
                      No, I already have my own contractor
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isFormInvalid}
                className={`w-full py-3  rounded-lg ${
                  isFormInvalid
                    ? "bg-[#2D332C]/25 text-[#EFEADF]/50 cursor-not-allowed"
                    : "bg-[#2D332C] text-[#EFEADF] hover:bg-[#1A1F19]"
                } mt-2`}
              >
                Claim my free consultation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

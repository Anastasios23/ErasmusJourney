import React, { createContext, useContext } from "react";

interface FormData {
  basicInfo?: any;
  courses?: any;
  accommodation?: any;
  livingExpenses?: any;
  experience?: any;
}

interface FormContextType {
  formData: FormData;
  currentStep: number;
  onSave: (data: any) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: React.ReactNode;
  formData: FormData;
  onSave: (data: any) => void;
  currentStep: number;
}

export function FormProvider({
  children,
  formData,
  onSave,
  currentStep,
}: FormProviderProps) {
  const value: FormContextType = {
    formData,
    currentStep,
    onSave,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}

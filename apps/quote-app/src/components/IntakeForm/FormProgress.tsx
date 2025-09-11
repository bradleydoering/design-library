import { cn } from "@/lib/utils";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function FormProgress({ currentStep, totalSteps, stepLabels }: FormProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        {stepLabels.map((label, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                "[clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]",
                index < currentStep
                  ? "bg-coral text-white"
                  : index === currentStep
                  ? "bg-coral-light text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "text-xs mt-2 text-center font-medium",
                index <= currentStep ? "text-navy" : "text-gray-400"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      
      <div className="w-full bg-gray-200 h-2 [clip-path:polygon(0.2rem_0%,100%_0%,100%_calc(100%-0.2rem),calc(100%-0.2rem)_100%,0%_100%,0%_0.2rem)]">
        <div
          className="h-2 bg-coral transition-all duration-300 [clip-path:polygon(0.2rem_0%,100%_0%,100%_calc(100%-0.2rem),calc(100%-0.2rem)_100%,0%_100%,0%_0.2rem)]"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
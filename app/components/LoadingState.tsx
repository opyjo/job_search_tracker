"use client";

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-20 h-20 border-4 border-amber-200 rounded-full animate-spin border-t-amber-500" />
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Tailoring Your Resume
        </h3>
        <p className="text-slate-500 max-w-md">
          Our AI is analyzing the job description and crafting a personalized
          resume optimized for this specific role...
        </p>
      </div>
      
      {/* Animated progress steps */}
      <div className="mt-8 flex flex-col gap-3 text-sm">
        <LoadingStep text="Analyzing job requirements" delay={0} />
        <LoadingStep text="Matching your experience" delay={1} />
        <LoadingStep text="Optimizing keywords" delay={2} />
        <LoadingStep text="Generating tailored content" delay={3} />
      </div>
    </div>
  );
};

interface LoadingStepProps {
  text: string;
  delay: number;
}

const LoadingStep = ({ text, delay }: LoadingStepProps) => {
  return (
    <div
      className="flex items-center gap-3 text-slate-600 animate-fade-in"
      style={{ animationDelay: `${delay * 0.8}s` }}
    >
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      <span>{text}</span>
    </div>
  );
};

export default LoadingState;


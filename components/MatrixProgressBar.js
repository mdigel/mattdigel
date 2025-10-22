'use client';

export default function MatrixProgressBar({ currentQuestion, totalQuestions }) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const phrase = "there is no spoon";
  const totalChars = phrase.length;
  const charsToShow = Math.floor((progress / 100) * totalChars);

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>question {currentQuestion + 1} of {totalQuestions}</span>
        <span></span>
      </div>
      <div className="relative w-[95%] bg-gray-200 rounded-full h-6 overflow-visible">
        {/* Percentage text positioned at the end of the progress bar container */}
        <div 
          className="absolute text-xs text-gray-500 -top-6"
          style={{ 
            left: '100%',
            transform: 'translateX(-50%)'
          }}
        >
          {Math.round(progress)}%
        </div>
        
        {/* Progress bar with text that's only visible through the fill */}
        <div 
          className="h-6 rounded-full transition-all duration-300 ease-in-out flex items-center justify-end px-3 relative overflow-hidden"
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(0, 128, 255, 0.8), rgba(0, 255, 255, 0.8), rgba(0, 255, 128, 0.8))'
          }}
        >
          <span className="text-white text-[40px] font-black tracking-widest uppercase leading-loose whitespace-nowrap">
            {phrase.substring(0, charsToShow)}
          </span>
        </div>
        
        {/* Gift icon positioned at the end of the progress bar container */}
        <div 
          className="absolute text-4xl flex items-center justify-center"
          style={{ 
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%) translateX(12px)'
          }}
        >
          🎁
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        {/* Animated Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-sky-200">Compiling player info...</h2>
          <p className="text-sm text-zinc-400">Crunching the numbers across all seasons</p>
        </div>
        
        {/* Animated dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}

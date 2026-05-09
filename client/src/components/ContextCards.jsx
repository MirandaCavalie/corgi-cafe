import DrinkCard from './DrinkCard'

export default function ContextCards({ recommendation, workContext, memoryStats }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-3 pb-2 min-w-max mx-auto justify-center px-2">
        {/* Drink Card */}
        <DrinkCard recommendation={recommendation} />

        {/* Work Context Card */}
        <div className="context-card pixel-border-sm bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded p-4 min-w-[180px] max-w-[220px]">
          <div className="text-xs font-pixel text-[#4A3228] mb-3">📄 WORK</div>
          {workContext && workContext.length > 0 ? (
            <ul className="space-y-1.5">
              {workContext.slice(0, 3).map((insight, i) => (
                <li key={i} className="text-xs text-[#4A3228] flex gap-1">
                  <span className="text-[#D4748A] flex-shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-[#C8A882] leading-relaxed">
              Drop a doc or tell me what you're working on!
            </div>
          )}
        </div>

        {/* Memory Card */}
        <div className="context-card pixel-border-sm bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200 rounded p-4 min-w-[160px] max-w-[200px]">
          <div className="text-xs font-pixel text-[#4A3228] mb-3">🧠 MEMORY</div>
          {memoryStats ? (
            <div className="space-y-1.5">
              {memoryStats.visitCount !== undefined && (
                <div className="text-xs text-[#4A3228]">
                  <span className="font-bold text-[#D4748A]">Visit #{memoryStats.visitCount}</span>
                </div>
              )}
              {memoryStats.favoriteDrink && (
                <div className="text-xs text-[#4A3228]">
                  Fav: <span className="font-semibold">{memoryStats.favoriteDrink}</span>
                </div>
              )}
              {memoryStats.moodTrend && (
                <div className="text-xs text-[#4A3228]">
                  Vibe: <span className="font-semibold">{memoryStats.moodTrend}</span>
                </div>
              )}
              {memoryStats.lastVisit && (
                <div className="text-xs text-[#7A5A4A]">
                  Last here: {memoryStats.lastVisit}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-[#C8A882] leading-relaxed">
              Your memory builds as we chat!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

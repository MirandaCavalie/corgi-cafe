import DrinkCard from './DrinkCard'

export default function ContextCards({ recommendation, workContext, memoryStats, crossSessionReference }) {
  return (
    <div className="w-full grid grid-cols-3 gap-3" style={{ maxHeight: '150px' }}>
      {/* Drink Card */}
      <DrinkCard recommendation={recommendation} />

      {/* Work Context Card */}
      <div className="context-card pixel-border-sm bg-white border-[#E8E8E8] rounded p-3 overflow-hidden flex flex-col">
        <div className="text-xs font-pixel text-[#FF5C00] mb-2">📄 WORK</div>
        <div className="flex-1 overflow-y-auto chat-scroll">
          {workContext && workContext.length > 0 ? (
            <ul className="space-y-1">
              {workContext.slice(0, 3).map((insight, i) => (
                <li key={i} className="text-xs text-[#1A1A1A] flex gap-1">
                  <span className="text-[#FF5C00] flex-shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-[#AAAAAA] leading-relaxed">
              Drop a doc or tell me what you're working on!
            </div>
          )}
        </div>
      </div>

      {/* Memory Card */}
      <div className="context-card pixel-border-sm bg-white border-[#E8E8E8] rounded p-3 overflow-hidden flex flex-col">
        <div className="text-xs font-pixel text-[#FF5C00] mb-2">🧠 MEMORY</div>
        <div className="flex-1 overflow-y-auto chat-scroll">
          {memoryStats ? (
            <div className="space-y-1">
              {memoryStats.visitCount !== undefined && (
                <div className="text-xs">
                  <span className="font-bold text-[#FF5C00]">Visit #{memoryStats.visitCount}</span>
                </div>
              )}
              {memoryStats.favoriteDrink && (
                <div className="text-xs text-[#1A1A1A]">
                  Fav: <span className="font-semibold">{memoryStats.favoriteDrink}</span>
                </div>
              )}
              {memoryStats.moodTrend && (
                <div className="text-xs text-[#1A1A1A]">
                  Vibe: <span className="font-semibold">{memoryStats.moodTrend}</span>
                </div>
              )}
              {memoryStats.lastVisit && (
                <div className="text-xs text-[#666666]">
                  Last: {memoryStats.lastVisit}
                </div>
              )}
              {crossSessionReference && (
                <div className="text-xs text-[#FF5C00] italic mt-1 border-t border-[#F0F0F0] pt-1">
                  "{crossSessionReference}"
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-[#AAAAAA] leading-relaxed">
              Your memory builds as we chat!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

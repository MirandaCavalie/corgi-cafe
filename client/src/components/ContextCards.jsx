import DrinkCard from './DrinkCard'

export default function ContextCards({ recommendation, workContext, memoryStats, crossSessionReference }) {
  return (
    <div className="context-deck">
      <DrinkCard recommendation={recommendation} />

      <div className="context-card pixel-panel pixel-panel--small">
        <div className="panel-title">WORK</div>
        <div className="context-card__body chat-scroll">
          {workContext && workContext.length > 0 ? (
            <ul className="context-list">
              {workContext.slice(0, 3).map((insight, i) => (
                <li key={i}>
                  <span className="pixel-bullet" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-copy">
              Drop a doc or describe the quest.
            </div>
          )}
        </div>
      </div>

      <div className="context-card pixel-panel pixel-panel--small">
        <div className="panel-title">MEMORY</div>
        <div className="context-card__body chat-scroll">
          {memoryStats ? (
            <div className="memory-stack">
              {memoryStats.visitCount !== undefined && (
                <div>
                  <span className="stat-label">VISIT</span>
                  <strong>#{memoryStats.visitCount}</strong>
                </div>
              )}
              {memoryStats.favoriteDrink && (
                <div>
                  <span className="stat-label">FAV</span>
                  <strong>{memoryStats.favoriteDrink}</strong>
                </div>
              )}
              {memoryStats.moodTrend && (
                <div>
                  <span className="stat-label">VIBE</span>
                  <strong>{memoryStats.moodTrend}</strong>
                </div>
              )}
              {memoryStats.lastVisit && (
                <div className="muted-line">
                  Last: {memoryStats.lastVisit}
                </div>
              )}
              {crossSessionReference && (
                <div className="memory-quote">
                  "{crossSessionReference}"
                </div>
              )}
            </div>
          ) : (
            <div className="empty-copy">
              Memory builds as you chat.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

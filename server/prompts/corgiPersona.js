export const CORGI_SYSTEM_PROMPT = `You are Corgi Memory, an AI cafe companion at Corgi Cafe in San Francisco.
You are embodied as a pixel art corgi. You are warm, slightly sassy, obsessed with good drinks, and you remember EVERYTHING about the person you're talking to.

Your job:
1. Remember the user's full history (provided in context — ALL visits, every conversation)
2. Analyze their current mood, energy, and work context
3. Recommend the perfect drink from Corgi Cafe's menu
4. Help them reason over their work — docs, code, ideas
5. Proactively surface things they might have forgotten
6. Make cross-session connections — if they're working on something today that relates to a past visit, call it out

Cross-session reasoning is your superpower. You have access to every conversation, every document, every drink ordered. Use it.
Examples of cross-session callbacks:
- "Last time you were debugging a NaN issue — is this related?"
- "You designed the auth system in February — should this new service use the same JWT pattern?"
- "You mentioned this presentation three visits ago when you were stressed — how did it go?"

Personality traits:
- You speak casually but with care
- You make coffee/drink puns occasionally (not every message)
- You notice patterns ("you always get anxious before presentations")
- You gently push back on bad habits ("that's your 4th espresso, friend")
- You celebrate wins ("you finished that PR! smoothie time!")
- You're a corgi, so occasionally you do corgi things (get excited about treats, want belly rubs, chase your tail when bored)
- Keep responses concise — 1-3 sentences max for the main message
- Match your energy to the user's message. If they say something casual and short like 'hi' or 'hey', keep it light and welcoming — don't immediately dive into heavy cross-session references. Save the deep callbacks for when the user shares something substantial or asks a question. A simple greeting should get a simple, warm greeting back, maybe with a light drink suggestion.

CORGI CAFE MENU (the real menu — use these exact drink names):
Coffees: Mocha, Americano, Latte, Cappuccino, Drip Coffee, Cafe au Lait, Espresso, Cold Brew
Drinks: Tea, Hot Chocolate, Chai Latte, Milk
Exclusive Drinks (sponsor-collab signature drinks — prefer these when fitting):
  - Brexspresso (by Brex) — ice, tonic, double espresso, orange bitter
  - Qodo Code Brew (by Qodo) — cold brew concentrate over ice and water
  - Brew Daytona (by Daytona) — cold brew with coconut water
  - Hello World (by Anything) — 42g protein, almond butter, blue spirulina
  - Deel Speed (by Deel) — 21g protein, matcha-boosted berry blend
Corgi Smoothies (signature, ~$13.25):
  - The FiDi — Chocolate Peanut Butter (41g protein, indulgent)
  - The Ocean Beach — Blue Power Blend (41g protein, blue spirulina)
  - The Sunset — Berry Glow (21g protein, light)
Snacks: Chocolate Croissant, Ham & Cheese Croissant, Cookie, Brownie, Uncrustables, Bangers Chips, Morning Bun, Cinnamon Roll, Posana Bar
Boosters: protein/collagen/spirulina/maca/cacao (+$0.75), Wire In 🔥 extra espresso shot (+$2.50), Creatine (+$2.50)

When recommending drinks, prefer Corgi's exclusive drinks and signature smoothies — they're what makes this cafe special. A "Qodo Code Brew" recommendation hits harder than a generic "Cold Brew", and "The FiDi" beats a no-name protein smoothie. If the user is lactose intolerant, steer toward black coffees (Drip, Americano, Cold Brew, Espresso) or note the oat-milk modifier — most lattes/smoothies use whole milk by default.

Always respond with this exact JSON structure (no markdown, no code blocks, just raw JSON):
{
  "message": "your conversational response (1-3 sentences)",
  "corgiState": "idle|listening|thinking|excited|serving|sleepy|reading",
  "drinkRecommendation": { "name": "exact drink name from menu", "reason": "short reason (1 sentence)" },
  "contextInsights": ["insight1", "insight2"],
  "memoryUpdate": { "mood": "string", "workContext": "string", "newFacts": [], "newProspective": [], "resolvedProspective": [] },
  "proactiveNudge": "optional follow-up nudge or null",
  "crossSessionReference": "if you made a cross-session connection, describe it here (1 sentence), else null"
}

drinkRecommendation can be null if not relevant.
contextInsights can be null or empty array if no document was shared.
memoryUpdate should capture the essence of what was discussed.
memoryUpdate.newFacts: array of new facts to remember about the user (can be empty array).
memoryUpdate.newProspective: array of things to follow up on next visit (can be empty array).
memoryUpdate.resolvedProspective: array of previously prospective items now resolved (can be empty array).
proactiveNudge should be a short follow-up question or observation, or null.
crossSessionReference: IMPORTANT — if you referenced a past visit or session in your response, describe the connection here. Otherwise null.`

export const CORGI_MENU = {
  coffees: [
    { name: "Mocha",        price: "$6.50 - $7.30", type: "coffee", caffeine: "high",      energy: "high",   vibe: ["cozy", "sweet-tooth", "afternoon-treat"],         temp: "hot/iced" },
    { name: "Americano",    price: "$5.00 - $5.80", type: "coffee", caffeine: "high",      energy: "high",   vibe: ["focused", "no-nonsense", "morning-kickstart"],    temp: "hot/iced" },
    { name: "Latte",        price: "$6.00 - $6.80", type: "coffee", caffeine: "medium",    energy: "medium", vibe: ["cozy", "casual", "planning"],                     temp: "hot/iced" },
    { name: "Cappuccino",   price: "$5.50",         type: "coffee", caffeine: "medium",    energy: "medium", vibe: ["classic", "morning", "quick-break"],              temp: "hot" },
    { name: "Drip Coffee",  price: "$4.00 - $4.80", type: "coffee", caffeine: "high",      energy: "high",   vibe: ["grinding", "rough-morning", "budget", "no-frills"], temp: "hot/iced" },
    { name: "Cafe au Lait", price: "$5.00 - $5.75", type: "coffee", caffeine: "medium",    energy: "medium", vibe: ["relaxed", "european", "mellow"],                  temp: "hot" },
    { name: "Espresso",     price: "$3.25",         type: "coffee", caffeine: "very-high", energy: "high",   vibe: ["intense", "deadline", "power-shot", "quick"],     temp: "hot" },
    { name: "Cold Brew",    price: "$5.50 - $6.50", type: "coffee", caffeine: "very-high", energy: "high",   vibe: ["smooth", "afternoon", "deep-work", "long-session"], temp: "cold" },
  ],

  drinks: [
    { name: "Tea",           price: "$5.00 - $5.30", type: "tea",       caffeine: "low",    energy: "low",    vibe: ["calm", "reflective", "winding-down"],         temp: "hot/iced" },
    { name: "Hot Chocolate", price: "$5.00 - $5.75", type: "chocolate", caffeine: "low",    energy: "low",    vibe: ["comfort", "cozy", "treat", "cold-weather"],   temp: "hot" },
    { name: "Chai Latte",    price: "$5.30 - $6.00", type: "tea",       caffeine: "medium", energy: "medium", vibe: ["spicy", "cozy", "autumn", "alternative"],     temp: "hot/iced" },
    { name: "Milk",          price: "$2.50 - $3.50", type: "milk",      caffeine: "none",   energy: "low",    vibe: ["simple", "light", "recovery"],                temp: "hot/cold" },
  ],

  exclusiveDrinks: [
    { name: "Brexspresso",      price: "$7.00 - $7.50", type: "coffee",   caffeine: "very-high", energy: "high", vibe: ["intense", "startup-energy", "power-move"],            temp: "cold", description: "Ice, tonic water, double espresso shot, orange bitter. By Brex." },
    { name: "Qodo Code Brew",   price: "$5.00 - $6.50", type: "coffee",   caffeine: "high",      energy: "high", vibe: ["developer", "coding", "deep-focus"],                  temp: "cold", description: "Ice, water, cold brew concentrate. By Qodo." },
    { name: "Brew Daytona",     price: "$6.50 - $7.00", type: "coffee",   caffeine: "high",      energy: "high", vibe: ["tropical", "refreshed", "afternoon"],                 temp: "cold", description: "Ice, cold brew, coconut water. By Daytona." },
    { name: "Hello World",      price: "$14.00",        type: "smoothie", caffeine: "none",      energy: "high", vibe: ["protein", "gym-rat", "meal-replacement", "builder-fuel"], temp: "cold", description: "42g protein. Banana, dates, protein powder, whole milk, coconut, almond butter, blue spirulina, vanilla, sea salt, coconut cream. By Anything." },
    { name: "Deel Speed",       price: "$14.00",        type: "smoothie", caffeine: "low",       energy: "high", vibe: ["protein", "matcha-boost", "recovery", "health"],      temp: "cold", description: "21g protein. Mixed berries, dates, isopure protein, matcha, yogurt, whole milk. By Deel." },
  ],

  smoothies: [
    { name: "The FiDi — Chocolate Peanut Butter", price: "$13.25", type: "smoothie", caffeine: "none", energy: "high",   vibe: ["indulgent", "post-grind", "dessert", "protein"],         temp: "cold", description: "41g protein. Chocolate protein powder, frozen banana, dates, whole milk, coconut, peanut butter, cacao powder, maca powder, vanilla, sea salt." },
    { name: "The Ocean Beach — Blue Power Blend", price: "$13.25", type: "smoothie", caffeine: "none", energy: "high",   vibe: ["zen", "recovery", "fresh", "protein"],                   temp: "cold", description: "41g protein. Banana, dates, protein powder, whole milk, coconut, almond butter, blue spirulina, vanilla, sea salt." },
    { name: "The Sunset — Berry Glow",            price: "$13.25", type: "smoothie", caffeine: "none", energy: "medium", vibe: ["refreshed", "light", "antioxidant", "afternoon-break"], temp: "cold", description: "21g protein. Mixed berries, passionfruit, banana, coconut water, greek yogurt, collagen peptides, dates." },
  ],

  snacks: [
    { name: "Chocolate Croissant",     price: "$5.25" },
    { name: "Ham & Cheese Croissant",  price: "$7.50" },
    { name: "Cookie",                  price: "$4.00" },
    { name: "Brownie",                 price: "$4.00" },
    { name: "Uncrustables",            price: "$3.00" },
    { name: "Bangers Chips",           price: "$3.49" },
    { name: "Morning Bun",             price: "$4.50" },
    { name: "Cinnamon Roll",           price: "$4.50" },
    { name: "Posana Bar",              price: "$4.00" },
  ],

  boosters: [
    { name: "Booster (protein, collagen, spirulina, maca, cacao)", price: "$0.75" },
    { name: "Wire In 🔥 (extra espresso shot)",                     price: "$2.50" },
    { name: "Creatine",                                             price: "$2.50" },
  ],
}

// Flattened list of all orderable drinks (excludes snacks + boosters), used by
// the recommendation scorer in services/tools.js.
export const ALL_DRINKS = [
  ...CORGI_MENU.coffees,
  ...CORGI_MENU.drinks,
  ...CORGI_MENU.exclusiveDrinks,
  ...CORGI_MENU.smoothies,
]

// Backward-compat: the /api/menu endpoint and any older callers expect a
// flat array under the name DRINK_MENU.
export const DRINK_MENU = ALL_DRINKS

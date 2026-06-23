import { MessageIntent } from "../types/message";


// Patterns that require no knowledge base context 
const CONTEXT_FREE_PATTERNS : RegExp[] = [
    // Greetings — match one or more greeting tokens (e.g. "hii", "hey hii", "hey hello hello")
    /^((hi|hey|hello|hii|hiii|yo|sup|howdy|greetings)[!?.,\s]*)+$/i,

    // Thanks 
    /^(thanks|thank you|thankyou|thx|ty|thank u)[!?.,\s]*$/i,
    
    // Acknowledgements
    /^(ok|okay|got it|i see|understood|sure|alright|cool|nice|great|perfect|noted)[!?.,\s]*$/i,

    // Farewells
    /^(bye|goodbye|see you|cya|later|good night|gn|take care)[!?.,\s]*$/i,

    // Single word / very short meaningless input
    /^.{1,3}$/,
]

export function classifyMessageIntent(message : string) : MessageIntent {
    const trimmed = message.trim()

    for (const pattern of CONTEXT_FREE_PATTERNS){
        if (pattern.test(trimmed)) {
            // Fine-grained classification for better system prompt handling
            if (/hi|hey|hello|hii|yo|sup/i.test(trimmed)) return "greeting"
            if (/thanks|thank|thx|ty/i.test(trimmed)) return "thanks"
            if (/bye|goodbye|see you|later|gn/i.test(trimmed)) return "farewell"
            return "acknowledgement"
        }
    }

    return "subject_query"
}
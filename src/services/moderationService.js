// Free-tier AI moderation using Hugging Face Inference API
// No OpenAI key needed for MVP

const MODERATION_API = 'https://api-inference.huggingface.co/models/facebook/roberta-hate-speech-dynabench-r4-target'
const SUMMARY_API = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn'

export const moderateContent = async (text) => {
  try {
    const response = await fetch(MODERATION_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    })
    const result = await response.json()
    
    // Parse Hugging Face output format
    if (result[0]?.label) {
      return {
        flagged: result[0].label === 'hate',
        sentiment: result[0].label,
        confidence: result[0].score,
      }
    }
    return { flagged: false, sentiment: 'unknown', confidence: 0 }
  } catch (error) {
    console.error('Moderation API error:', error)
    // Fallback: simple keyword filter
    const badWords = ['gali', 'abuse', 'spam'] // Expand carefully
    return {
      flagged: badWords.some(word => text.toLowerCase().includes(word)),
      sentiment: 'neutral',
      confidence: 0.5,
    }
  }
}

export const summarizeText = async (text, maxLength = 100) => {
  try {
    const response = await fetch(SUMMARY_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: text,
        parameters: { max_length: maxLength, min_length: 30 }
      }),
    })
    const result = await response.json()
    return result[0]?.summary_text || text.substring(0, maxLength) + '...'
  } catch (error) {
    console.error('Summary API error:', error)
    return text.substring(0, maxLength) + '...' // Fallback truncation
  }
}

export const generateLeaderDigest = async (problems) => {
  // Group problems by category
  const byCategory = problems.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})
  
  // Create summary for each category
  const summaries = await Promise.all(
    Object.entries(byCategory).map(async ([category, items]) => {
      const combined = items.map(p => `• ${p.title}: ${p.description}`).join('\n')
      const summary = await summarizeText(combined, 150)
      return `${category.toUpperCase()} (${items.length} reports):\n${summary}`
    })
  )
  
  return summaries.join('\n\n')
        }

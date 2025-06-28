import { TranscriptionPlugin, TranscriptionConfig, Language } from '../../types/plugins.ts'
import { AudioBlob, TranscriptionResult, VoiceButtonError, ErrorCode } from '../../types/core.ts'

// Gemini Transcription Plugin (based on Pablo's brilliant geminiService implementation)
export class GeminiTranscriptionPlugin implements TranscriptionPlugin {
  readonly id = 'gemini'
  readonly name = 'Google Gemini'
  readonly version = '1.0.0'
  readonly description = 'High-quality transcription using Google Gemini 2.0 Flash'
  
  private apiKey?: string
  private model = 'gemini-2.0-flash-exp'
  private genAI: any
  private geminiModel: any

  async configure(config: GeminiConfig): Promise<void> {
    // Use environment variable for security
    this.apiKey = Deno.env.get('GEMINI_API_KEY') || config.apiKey
    this.model = config.model || 'gemini-2.0-flash'
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable not set')
    }
    
    console.log('✅ Gemini plugin configured with environment key')
  }

  validateConfig(config: unknown): config is GeminiConfig {
    return typeof config === 'object' && 
           config !== null && 
           'apiKey' in config &&
           typeof (config as any).apiKey === 'string'
  }

  async transcribe(audio: AudioBlob): Promise<TranscriptionResult> {
    if (!this.apiKey) {
      throw new VoiceButtonError(
        'Gemini API key not configured',
        ErrorCode.INVALID_CONFIG
      )
    }

    try {
      console.log('🤖 Starting Gemini transcription with REST API...')
      
      // Convert audio to base64 for the REST API
      const audioBase64 = await this.blobToBase64(audio.data)
      
      // Use the correct Gemini REST API format
      const requestBody = {
        contents: [{
          parts: [{
            text: "Transcribe this audio file accurately and completely, removing any redundant 'ums,' 'likes, 'uhs', and similar filler words. Return only the cleaned-up transcription, with no additional text."
          }, {
            inline_data: {
              mime_type: audio.data.type,
              data: audioBase64
            }
          }]
        }]
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Gemini API error:', errorText)
        throw new VoiceButtonError(
          `Gemini API error: ${response.status} ${response.statusText}`,
          ErrorCode.TRANSCRIPTION_API_ERROR,
          { response: errorText }
        )
      }
      
      const result = await response.json()
      console.log('🎉 Raw Gemini response:', result)
      
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      
      if (!text) {
        throw new VoiceButtonError(
          'Gemini returned empty transcription',
          ErrorCode.TRANSCRIPTION_FAILED,
          { result }
        )
      }

      console.log('✅ Gemini transcription completed:', {
        length: text.length,
        preview: text.substring(0, 50) + '...'
      })

      return {
        text,
        confidence: 0.95, // Gemini doesn't provide confidence scores
        language: 'en',
        metadata: {
          model: this.model,
          provider: 'gemini'
        }
      }
      
    } catch (error) {
      console.error('❌ Gemini transcription failed:', error)
      
      if (error instanceof VoiceButtonError) {
        throw error
      }
      
      throw new VoiceButtonError(
        'Gemini transcription failed',
        ErrorCode.TRANSCRIPTION_API_ERROR,
        { originalError: error }
      )
    }
  }

  async getLanguages(): Promise<Language[]> {
    // Gemini supports many languages, but we'll start with common ones
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
    ]
  }

  async estimateCost(audio: AudioBlob): Promise<number> {
    // Rough estimation: Gemini pricing is ~$0.075 per minute of audio
    const durationMinutes = audio.duration / 60
    return Math.max(0.01, durationMinutes * 0.075) // Minimum 1 cent
  }

  // Convert blob to base64 for REST API
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onloadend = () => {
        try {
          const result = reader.result as string
          const base64data = result.split(',')[1] // Remove data:audio/webm;base64, prefix
          resolve(base64data)
        } catch (error) {
          reject(new VoiceButtonError(
            'Failed to convert audio to base64',
            ErrorCode.TRANSCRIPTION_FAILED,
            { originalError: error }
          ))
        }
      }
      
      reader.onerror = () => {
        reject(new VoiceButtonError(
          'Failed to read audio file',
          ErrorCode.TRANSCRIPTION_FAILED
        ))
      }
      
      reader.readAsDataURL(blob)
    })
  }
}

// Enhanced Gemini Service (Pablo's additional AI features as separate methods)
export class GeminiAIService {
  private genAI: any
  private model: any

  constructor(apiKey: string, modelName = 'gemini-2.0-flash-exp') {
    // This will be initialized when needed
  }

  async init(apiKey: string, modelName = 'gemini-2.0-flash-exp') {
    const { GoogleGenerativeAI } = await import('https://esm.sh/@google/generative-ai@0.2.1')
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({ model: modelName })
  }

  // Pablo's extractActionItems implementation
  async extractActionItems(text: string): Promise<any[]> {
    try {
      console.log('🤖 Extracting action items with Gemini')
      const prompt = `Analyze the following conversation and extract or suggest action items.
      First, look for any explicit action items, tasks, or commitments mentioned.
      Then, based on the topics discussed, suggest relevant follow-up actions or research tasks.

      For example, if people discuss AI ethics but don't specify actions, you could suggest:
      "Research current AI ethics guidelines and frameworks"

      For each action item (found or suggested), identify:
      - The task description
      - Who should do it (if mentioned, otherwise leave as null)
      - A reasonable suggested due date (or null if not time-sensitive)

      Return a JSON array of action items with this structure:
      [
          {
              "description": "Complete task description",
              "assignee": "Person name or null",
              "due_date": "YYYY-MM-DD or null"
          }
      ]

      If no explicit action items are found, generate at least 3-5 suggested actions based on the conversation topics.
      CONVERSATION: ${text}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      
      let jsonString = response.text().trim()
      jsonString = jsonString.replace(/^```(json)?\s*/, '')
      jsonString = jsonString.replace(/\s*```$/, '')

      try {
        const actionItems = JSON.parse(jsonString)
        console.log('📋 Extracted action items:', actionItems)
        return actionItems
      } catch (e) {
        console.error('Error parsing action items JSON:', e)
        return []
      }
    } catch (error) {
      console.error('Error extracting action items:', error)
      return []
    }
  }

  // Pablo's generateTitle implementation
  async generateTitle(transcript: string): Promise<string> {
    try {
      console.log('📝 Generating title with Gemini')
      const prompt = `Generate a concise and descriptive title (3-4 words maximum) for this conversation transcript. Return only the title text, no quotes or additional text.
      
      TRANSCRIPT: ${transcript}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const title = response.text().trim()
      console.log('✨ Generated title:', title)
      return title
    } catch (error) {
      console.error('❌ Error generating title:', error)
      throw new Error('Failed to generate title with Gemini')
    }
  }

  // Pablo's extractKeywords implementation  
  async extractKeywords(text: string): Promise<any> {
    if (!text) return { nodes: [], edges: [] }
    
    try {
      const prompt = `Analyze the following conversation and extract the main topics and their relationships.
      I want a you to break down the conversation into the topics covered and how they are related.
      I'm not interested in a chronoliogical order, but rather the relationships of the topics.

      The purpose of this it to provide a live visualisation of the conversation for note taking but also to
      prevent interruptions of the speaker by letting all participants have a visualisation of what all the topics
      that have been mentioned/discussed so that they can circle back to them later.
      Make sure to include all the main topics and their relationships, err in favour of more topics rather than less.

      Use a color scheme for the edges to show the relationships between the topics.
      Base the colours on having a white background but being muted and understated modern style of understated colours.
      Dont make it black and white.

      Provide an emoji for each topic in the emoji field. Do not include the emoji in the label.

      Return a JSON object with the following structure:
      {
          "nodes": [
              {
                  "id": "node1",
                  "label": "Topic 1",
                  "color": "#4287f5",
                  "emoji": "😀"
              },
              {
                  "id": "node2", 
                  "label": "Topic 2",
                  "color": "#42f5a7",
                  "emoji": "🤔"
              }
          ],
          "edges": [
              {
                  "source_topic_id": "node1",
                  "target_topic_id": "node2",
                  "color": "#999999"
              }
          ]
      }
      
      IMPORTANT: Only summarise the conversation which is the text below denoted as CONVERSATION.

      CONVERSATION: ${text}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      let jsonString = response.text()
      
      console.log('🤖 Raw Gemini response:', jsonString)
      
      // Clean up JSON
      jsonString = jsonString.trim()
      jsonString = jsonString.replace(/^```(json)?\s*/, '')
      jsonString = jsonString.replace(/\s*```$/, '')
      jsonString = jsonString.replace(/^.*?({.*}).*?$/, '$1')

      try {
        const data = JSON.parse(jsonString)
        console.log('🤖 Gemini response parsed:', {
          nodeCount: data.nodes?.length || 0,
          edgeCount: data.edges?.length || 0
        })
        return data
      } catch (e) {
        console.error('Error parsing JSON response', e, jsonString)
        return { nodes: [], edges: [] }
      }
    } catch (error) {
      console.error('Error extracting topics:', error)
      return { nodes: [], edges: [] }
    }
  }

  // Pablo's generateMarkdown implementation
  async generateMarkdown(prompt: string, text: string): Promise<string> {
    try {
      console.log('📝 Generating markdown with Gemini')
      const fullPrompt = `Transform the following conversation text according to these instructions:
      
      ${prompt}

      Return the result in markdown format, properly formatted and structured.
      Only return the markdown content, no additional text or explanations.
      Use proper markdown syntax including headers, lists, code blocks, etc as appropriate.
      
      CONVERSATION TEXT:
      ${text}`

      const result = await this.model.generateContent(fullPrompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Error generating markdown:', error)
      throw new Error('Failed to generate markdown with Gemini')
    }
  }
}

// Configuration interface
export interface GeminiConfig extends TranscriptionConfig {
  apiKey: string
  model?: string
}
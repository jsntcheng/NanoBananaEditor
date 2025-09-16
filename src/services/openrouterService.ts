export interface OpenRouterRequest {
  prompt: string;
  model: string;
  temperature?: number;
  seed?: number;
  referenceImages?: string[]; // base64 array
}

export interface OpenRouterEditRequest {
  instruction: string;
  originalImage: string; // base64
  model: string;
  referenceImages?: string[]; // base64 array
  maskImage?: string; // base64
  temperature?: number;
  seed?: number;
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: OpenRouterRequest): Promise<string[]> {
    try {
      // Build the messages array
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: request.prompt }
          ]
        }
      ];

      // Add reference images if provided
      if (request.referenceImages && request.referenceImages.length > 0) {
        request.referenceImages.forEach(image => {
          messages[0].content.push({
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${image}`
            }
          });
        });
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Nano Banana Image Editor'
        },
        body: JSON.stringify({
          model: request.model,
          messages,
          temperature: request.temperature || 0.7,
          seed: request.seed,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // For now, return a placeholder since OpenRouter doesn't directly support image generation
      // In a real implementation, you'd need to use a model that supports image generation
      // or convert the text response to an image generation request
      throw new Error('Image generation not yet supported with OpenRouter. Please use Gemini for image generation.');
      
    } catch (error) {
      console.error('Error generating image with OpenRouter:', error);
      throw new Error('Failed to generate image with OpenRouter. Please try again.');
    }
  }

  async editImage(request: OpenRouterEditRequest): Promise<string[]> {
    try {
      // Similar to generateImage, but for editing
      // This would need to be implemented based on the specific model's capabilities
      throw new Error('Image editing not yet supported with OpenRouter. Please use Gemini for image editing.');
      
    } catch (error) {
      console.error('Error editing image with OpenRouter:', error);
      throw new Error('Failed to edit image with OpenRouter. Please try again.');
    }
  }

  // Get available models for image generation/editing
  static getAvailableModels(): string[] {
    return [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      'google/gemini-pro-1.5',
      'meta-llama/llama-3.2-90b-vision-instruct'
    ];
  }
}

export const createOpenRouterService = (apiKey: string) => {
  return new OpenRouterService(apiKey);
};
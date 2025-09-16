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

  private buildEditPrompt(request: OpenRouterEditRequest): string {
    const maskInstruction = request.maskImage 
      ? "\n\nIMPORTANT: Apply changes ONLY where the mask image shows white pixels (value 255). Leave all other areas completely unchanged. Respect the mask boundaries precisely and maintain seamless blending at the edges."
      : "";

    return `Edit this image according to the following instruction: ${request.instruction}

Maintain the original image's lighting, perspective, and overall composition. Make the changes look natural and seamlessly integrated.${maskInstruction}

Preserve image quality and ensure the edit looks professional and realistic.`;
  }

  async generateImage(request: OpenRouterRequest): Promise<string[]> {
    try {
      const content: any[] = [{ type: 'text', text: request.prompt }];

      if (request.referenceImages && request.referenceImages.length > 0) {
        request.referenceImages.forEach(image => {
          content.push({
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
          messages: [{ role: 'user', content }],
          temperature: request.temperature || 0.7,
          seed: request.seed,
          max_tokens: 4096, // Increased for image data
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      if (!choice || !choice.message) {
        throw new Error(`Invalid response structure from OpenRouter: ${JSON.stringify(data)}`);
      }

      const message = choice.message;
      const images: string[] = [];

      // Prioritize the 'images' array in the message object
      if (message.images && Array.isArray(message.images) && message.images.length > 0) {
        for (const img of message.images) {
          if (img.image_url && img.image_url.url) {
            const urlParts = img.image_url.url.split(',');
            const base64Data = urlParts.length > 1 ? urlParts[1] : '';
            if (base64Data) {
              images.push(base64Data);
            }
          }
        }
      }
      // Fallback to checking the 'content' array for images
      else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === 'image_url' && part.image_url?.url) {
            const urlParts = part.image_url.url.split(',');
            const base64Data = urlParts.length > 1 ? urlParts[1] : '';
            if (base64Data) {
              images.push(base64Data);
            }
          }
        }
      }

      if (images.length === 0) {
        // If content is a string, it's likely an error or text-only response
        if (typeof message.content === 'string' && message.content.trim()) {
          throw new Error(`OpenRouter returned a text response instead of an image: ${message.content}`);
        }
        throw new Error(`No image data found in OpenRouter response. Raw response: ${JSON.stringify(data)}`);
      }

      return images;
      
    } catch (error) {
      console.error('Error generating image with OpenRouter:', error);
      throw new Error(`Failed to generate image with OpenRouter. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  }

  async editImage(request: OpenRouterEditRequest): Promise<string[]> {
    try {
      const content: any[] = [{ type: 'text', text: this.buildEditPrompt(request) }];

      // Add original image
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${request.originalImage}`
        }
      });

      // Add reference images if provided
      if (request.referenceImages && request.referenceImages.length > 0) {
        request.referenceImages.forEach(image => {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${image}`
            }
          });
        });
      }

      // Add mask image if provided
      if (request.maskImage) {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/png;base64,${request.maskImage}`
          }
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
          messages: [{ role: 'user', content }],
          temperature: request.temperature || 0.7,
          seed: request.seed,
          max_tokens: 4096,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      if (!choice || !choice.message) {
        throw new Error(`Invalid response structure from OpenRouter: ${JSON.stringify(data)}`);
      }

      const message = choice.message;
      const images: string[] = [];

      // Prioritize the 'images' array in the message object
      if (message.images && Array.isArray(message.images) && message.images.length > 0) {
        for (const img of message.images) {
          if (img.image_url && img.image_url.url) {
            const urlParts = img.image_url.url.split(',');
            const base64Data = urlParts.length > 1 ? urlParts[1] : '';
            if (base64Data) {
              images.push(base64Data);
            }
          }
        }
      }
      // Fallback to checking the 'content' array for images
      else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part.type === 'image_url' && part.image_url?.url) {
            const urlParts = part.image_url.url.split(',');
            const base64Data = urlParts.length > 1 ? urlParts[1] : '';
            if (base64Data) {
              images.push(base64Data);
            }
          }
        }
      }

      if (images.length === 0) {
        // If content is a string, it's likely an error or text-only response
        if (typeof message.content === 'string' && message.content.trim()) {
          throw new Error(`OpenRouter returned a text response instead of an image: ${message.content}`);
        }
        throw new Error(`No image data found in OpenRouter response. Raw response: ${JSON.stringify(data)}`);
      }

      return images;
      
    } catch (error) {
      console.error('Error editing image with OpenRouter:', error);
      throw new Error(`Failed to edit image with OpenRouter. ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  }

  // Get available models for image generation/editing
  static getAvailableModels(): string[] {
    return [
      'google/gemini-2.5-flash-image-preview'
    ];
  }
}

export const createOpenRouterService = (apiKey: string) => {
  return new OpenRouterService(apiKey);
};

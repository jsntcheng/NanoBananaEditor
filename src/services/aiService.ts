import { geminiService } from './geminiService';
import { createOpenRouterService, OpenRouterService } from './openrouterService';
import { AIProvider } from '../types';

export interface UnifiedGenerationRequest {
  prompt: string;
  referenceImages?: string[];
  temperature?: number;
  seed?: number;
  provider: AIProvider;
  model: string;
}

export interface UnifiedEditRequest {
  instruction: string;
  originalImage: string;
  referenceImages?: string[];
  maskImage?: string;
  temperature?: number;
  seed?: number;
  provider: AIProvider;
  model: string;
}

export class AIService {
  static async generateImage(request: UnifiedGenerationRequest): Promise<string[]> {
    if (request.provider.id === 'gemini') {
      return geminiService.generateImage({
        prompt: request.prompt,
        referenceImages: request.referenceImages,
        temperature: request.temperature,
        seed: request.seed
      });
    } else if (request.provider.id === 'openrouter') {
      const openrouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!openrouterApiKey) {
        throw new Error('OpenRouter API key not configured');
      }
      
      const service = createOpenRouterService(openrouterApiKey);
      return service.generateImage({
        prompt: request.prompt,
        model: request.model,
        referenceImages: request.referenceImages,
        temperature: request.temperature,
        seed: request.seed
      });
    } else {
      throw new Error(`Unsupported AI provider: ${request.provider.id}`);
    }
  }

  static async editImage(request: UnifiedEditRequest): Promise<string[]> {
    if (request.provider.id === 'gemini') {
      return geminiService.editImage({
        instruction: request.instruction,
        originalImage: request.originalImage,
        referenceImages: request.referenceImages,
        maskImage: request.maskImage,
        temperature: request.temperature,
        seed: request.seed
      });
    } else if (request.provider.id === 'openrouter') {
      const openrouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!openrouterApiKey) {
        throw new Error('OpenRouter API key not configured');
      }
      
      const service = createOpenRouterService(openrouterApiKey);
      return service.editImage({
        instruction: request.instruction,
        originalImage: request.originalImage,
        model: request.model,
        referenceImages: request.referenceImages,
        maskImage: request.maskImage,
        temperature: request.temperature,
        seed: request.seed
      });
    } else {
      throw new Error(`Unsupported AI provider: ${request.provider.id}`);
    }
  }

  static getAvailableProviders(): AIProvider[] {
    return [
      {
        id: 'gemini',
        name: 'Google Gemini',
        models: ['gemini-2.5-flash-image-preview']
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        models: OpenRouterService.getAvailableModels()
      }
    ];
  }
}

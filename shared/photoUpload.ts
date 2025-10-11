// shared/photoUpload.ts
// Shared configuration and constants for photo upload functionality

export const PHOTO_UPLOAD_CONFIG = {
  // Maximum number of photos allowed per upload
  MAX_PHOTOS: 5,
  
  // Supported file types
  ACCEPTED_TYPES: "image/*,.heic,.heif",
  
  // Maximum file size per photo (in bytes) - 10MB
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // LLM providers and their privacy policies
  LLM_PROVIDERS: {
    openai: {
      name: "OpenAI",
      privacyPolicy: "https://openai.com/privacy",
      dataUsage: "Photos are sent to OpenAI for AI processing to generate educational content"
    },
    gemini: {
      name: "Google Gemini", 
      privacyPolicy: "https://policies.google.com/privacy",
      dataUsage: "Photos are sent to Google Gemini for AI processing to generate educational content"
    }
  }
} as const;

export type PhotoUploadConfig = typeof PHOTO_UPLOAD_CONFIG;

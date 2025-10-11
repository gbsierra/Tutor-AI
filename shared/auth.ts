import { z } from 'zod';

// Google OAuth user info schema
export const GoogleUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string().url().optional(),
  verified_email: z.boolean(),
});

export type GoogleUser = z.infer<typeof GoogleUserSchema>;

// Application user schema
export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  googleId: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatarUrl: z.string().url().optional(),
  displayName: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

// OAuth callback request schema
export const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export type OAuthCallbackRequest = z.infer<typeof OAuthCallbackSchema>;

// Authentication response schema
export const AuthResponseSchema = z.object({
  success: z.boolean(),
  user: AuthUserSchema.optional(),
  error: z.string().optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Photo attribution schemas
export const PhotoGroupSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  disciplineId: z.string().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PhotoGroup = z.infer<typeof PhotoGroupSchema>;

export const PhotoSchema = z.object({
  id: z.string().uuid(),
  photoGroupId: z.string().uuid(),
  uploadedBy: z.string().uuid(),
  filename: z.string(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  url: z.string().url().optional().nullable(),
  uploadedAt: z.date(),
});

export type Photo = z.infer<typeof PhotoSchema>;

export const UserContributionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  contributionType: z.enum(['photo', 'module', 'edit']),
  contributionId: z.string().uuid(),
  contributionData: z.record(z.string(), z.any()).optional(),
  createdAt: z.date(),
});

export type UserContribution = z.infer<typeof UserContributionSchema>;

// Module interface for user contributions
export interface UserModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  discipline: string;
  updated_at: string;
}

// User contributions interface for profile pages
export interface UserContributions {
  contributions: UserContribution[];
  modules: UserModule[];
  photos: Photo[];
}

// Photo attribution display schema
export const PhotoAttributionSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().optional(),
  name: z.string(),
  photoCount: z.number(),
});

export type PhotoAttribution = z.infer<typeof PhotoAttributionSchema>;

// Module photo attribution for display
export const ModulePhotoAttributionSchema = PhotoSchema.extend({
  photoId: z.string().uuid(),
  uploadedByName: z.string(),
  uploadedByDisplayName: z.string().optional(),
  photoGroupTitle: z.string(),
});

export type ModulePhotoAttribution = z.infer<typeof ModulePhotoAttributionSchema>;

// Module with photo attributions
export const ModuleWithPhotoAttributionsSchema = z.object({
  module: z.object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    discipline: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  photoAttributions: z.array(ModulePhotoAttributionSchema),
  totalPhotos: z.number(),
  contributors: z.array(PhotoAttributionSchema),
});

export type ModuleWithPhotoAttributions = z.infer<typeof ModuleWithPhotoAttributionsSchema>;

// Gmail email validation
export const validateGmailEmail = (email: string): boolean => {
  const validDomains = ['@gmail.com', '@googlemail.com'];
  return validDomains.some(domain => email.endsWith(domain));
};

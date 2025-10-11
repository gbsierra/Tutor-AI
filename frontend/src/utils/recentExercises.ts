// Utility for tracking recent exercises via API
import { getApiClient } from "@shared/apiClient";
import type { RecentExercise } from "@shared/types";

export async function addRecentExercise(moduleSlug: string, exerciseSlug: string, exerciseTitle: string): Promise<void> {
  try {
    const apiClient = getApiClient();
    await apiClient.post('/api/recent-exercises', {
      moduleSlug,
      exerciseSlug,
      exerciseTitle
    });
  } catch (error) {
    console.warn('Failed to save recent exercise:', error);
  }
}

export async function getRecentExercises(moduleSlug?: string): Promise<RecentExercise[]> {
  try {
    const apiClient = getApiClient();
    const endpoint = moduleSlug 
      ? `/api/recent-exercises?moduleSlug=${encodeURIComponent(moduleSlug)}`
      : '/api/recent-exercises';
    
    const data = await apiClient.get<{ recentExercises: RecentExercise[] }>(endpoint);
    return data.recentExercises || [];
  } catch (error) {
    console.warn('Failed to load recent exercises:', error);
    return [];
  }
}

export async function getRecentExercisesForModule(moduleSlug: string): Promise<RecentExercise[]> {
  return getRecentExercises(moduleSlug);
}

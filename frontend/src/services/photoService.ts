import type { RecentPhoto, RecentPhotosResponse } from '@shared/types';
import { getApiClient } from '@shared/apiClient';

/**
 * Photo service for handling photo-related API calls
 */
export class PhotoService {
  /**
   * Get recent photos for landing page carousel (public endpoint)
   */
  static async getRecentPhotos(limit: number = 12): Promise<RecentPhoto[]> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get<RecentPhotosResponse>(`/api/photos/recent?limit=${limit}`);
      return response.photos;
    } catch (error) {
      throw error;
    }
  }
}

import api from './client';
import type { Rating, Expert } from '../types/rating';
import type { SubmitRatingRequest } from '../types/api';

export interface RatingWithRelations extends Rating {
  expert: {
    id: string;
    name: string;
  };
  da: {
    id: string;
    name: string;
    componentId?: string;
  };
}

export interface ExpertWithCount extends Expert {
  _count: {
    ratings: number;
  };
}

export interface AggregatedRating {
  daId: string;
  daName: string;
  componentId: string;
  ratingsCount: number;
  aggregatedValue: number | null;
}

export const ratingsApi = {
  // === EXPERTS ===

  // List experts
  listExperts: async (systemId: string): Promise<ExpertWithCount[]> => {
    const response = await api.get<ExpertWithCount[]>(
      `/systems/${systemId}/ratings/experts`
    );
    return response.data;
  },

  // Create expert
  createExpert: async (
    systemId: string,
    data: { name: string; email?: string; expertise?: string[]; weight?: number }
  ): Promise<Expert> => {
    const response = await api.post<Expert>(
      `/systems/${systemId}/ratings/experts`,
      data
    );
    return response.data;
  },

  // Delete expert
  deleteExpert: async (systemId: string, expertId: string): Promise<void> => {
    await api.delete(`/systems/${systemId}/ratings/experts/${expertId}`);
  },

  // === RATINGS ===

  // List all ratings
  list: async (systemId: string): Promise<RatingWithRelations[]> => {
    const response = await api.get<RatingWithRelations[]>(
      `/systems/${systemId}/ratings`
    );
    return response.data;
  },

  // Get ratings for specific DA
  getByDA: async (
    systemId: string,
    daId: string
  ): Promise<RatingWithRelations[]> => {
    const response = await api.get<RatingWithRelations[]>(
      `/systems/${systemId}/ratings/by-da/${daId}`
    );
    return response.data;
  },

  // Submit rating (upsert)
  submit: async (
    systemId: string,
    data: SubmitRatingRequest
  ): Promise<RatingWithRelations> => {
    const response = await api.post<RatingWithRelations>(
      `/systems/${systemId}/ratings`,
      data
    );
    return response.data;
  },

  // Delete rating
  delete: async (systemId: string, ratingId: string): Promise<void> => {
    await api.delete(`/systems/${systemId}/ratings/${ratingId}`);
  },

  // Get aggregated ratings per DA
  getAggregated: async (systemId: string): Promise<AggregatedRating[]> => {
    const response = await api.get<AggregatedRating[]>(
      `/systems/${systemId}/ratings/aggregated`
    );
    return response.data;
  },
};

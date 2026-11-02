/**
 * DSA Topic Contracts & Data Shapes
 */

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  problemCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateTopicDto {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
}

export interface UpdateTopicDto {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  order?: number;
}

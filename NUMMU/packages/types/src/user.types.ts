/**
 * System roles for NUMU platform users.
 */
export type Role = 'STUDENT' | 'TRAINER' | 'COLLEGE_ADMIN' | 'PLATFORM_ADMIN';

/**
 * Roles within an Organization.
 */
export type OrganizationRole = 'OWNER' | 'ADMIN' | 'TRAINER' | 'MEMBER';

/**
 * User profile extended data.
 */
export type Profile = {
  id: string;
  userId: string;
  bio: string | null;
  headline: string | null;
  avatarUrl: string | null;
  college: string | null;
  gradYear: number | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  location: string | null;
  skills: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

/**
 * Base user shape shared across the API boundary.
 */
export type User = {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  profile?: Profile | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

/**
 * Public-facing profile (safe to expose publicly without private details).
 */
export type PublicUserProfile = {
  id: string;
  username: string | null;
  name: string | null;
  role: Role;
  profile?: Omit<Profile, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | null;
  createdAt: string | Date;
};

/**
 * Legacy UserProfile alias for backward-compatibility.
 */
export type UserProfile = PublicUserProfile;

/**
 * Authentication response returned upon successful register/login/refresh.
 */
export type AuthResponse = {
  user: User;
  accessToken?: string; // Kept optional for non-browser/CLI clients only; browser relies on HttpOnly cookies
  tokenType?: 'Bearer';
  expiresIn?: number; // in seconds
};

/**
 * Organization representation.
 */
export type Organization = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

/**
 * Organization membership representation.
 */
export type OrganizationMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  organization?: Organization;
  createdAt: string | Date;
  updatedAt: string | Date;
};

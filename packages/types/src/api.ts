import type {
  ContentStatus,
  ContentType,
  FontSize,
  InstitutionRole,
  Language,
  Theme,
  XPSourceType,
} from './enums'
import type { SensoryProfile, NotificationSettings } from './sensory'
import type { User } from './entities'

// ---------------------------------------------------------------------------
// Generic wrappers
// ---------------------------------------------------------------------------

export interface APIResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface APIError {
  error: string
  code: string
  statusCode: number
  details?: Record<string, string[]>
}

// ---------------------------------------------------------------------------
// Auth DTOs
// ---------------------------------------------------------------------------

export interface RegisterDTO {
  email: string
  name: string
  password: string
  inviteToken?: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

// ---------------------------------------------------------------------------
// Content DTOs
// ---------------------------------------------------------------------------

export interface CreateCourseDTO {
  title: string
  description?: string
  language: Language
  isPremium?: boolean
}

export interface UpdateCourseDTO {
  title?: string
  description?: string
  status?: ContentStatus
  thumbnailUrl?: string
}

export interface CreateModuleDTO {
  courseId: string
  title: string
  order: number
}

export interface CreateLessonDTO {
  moduleId: string
  title: string
  contentType: ContentType
  durationMinutes: number
  order: number
  isPremium?: boolean
}

// ---------------------------------------------------------------------------
// Gamification DTOs
// ---------------------------------------------------------------------------

export interface AwardXPDTO {
  userId: string
  sourceType: XPSourceType
  sourceId?: string
  xpAmount: number
}

export interface UpdateProgressDTO {
  lessonId: string
  score?: number
  timeSpentSeconds?: number
  completed?: boolean
}

// ---------------------------------------------------------------------------
// Institution DTOs
// ---------------------------------------------------------------------------

export interface CreateInstitutionDTO {
  name: string
  licenseSeats: number
}

export interface InviteMemberDTO {
  email?: string
  role: InstitutionRole
}

// ---------------------------------------------------------------------------
// Preferences DTO
// ---------------------------------------------------------------------------

export interface UpdatePreferencesDTO {
  theme?: Theme
  language?: Language
  sensoryProfile?: Partial<SensoryProfile>
  focusDurationMinutes?: number
  animationsEnabled?: boolean
  soundEnabled?: boolean
  fontSize?: FontSize
  notificationSettings?: Partial<NotificationSettings>
}

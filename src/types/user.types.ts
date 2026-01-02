export type UserRole = 'SDR' | 'Admin'

export interface UserProfile {
  id: string
  role: UserRole
  nome_completo: string | null
  created_at: string
}

export interface User {
  id: string
  email?: string
  user_metadata?: {
    nome_completo?: string
  }
  profile?: UserProfile
}


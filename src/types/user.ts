export interface UserResponse {
  id: number
  name: string
  email: string
  age: number
  licenseCategory: string
  licenseVerified: boolean
  role: 'USER' | 'ADMIN'
}
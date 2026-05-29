import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/userService'
import type { UserResponse } from '../types/user'

function DashboardPage() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setError('Failed to load user. Please login again.')
      }
    }

    loadUser()
  }, [])

  if (error) {
    return <p>{error}</p>
  }

  if (!user) {
    return <p>Loading dashboard...</p>
  }

  return (
    <section>
      <h1>Dashboard</h1>

      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>License category: {user.licenseCategory}</p>
      <p>
        License verified: {user.licenseVerified ? 'Yes' : 'No'}
      </p>
    </section>
  )
}

export default DashboardPage
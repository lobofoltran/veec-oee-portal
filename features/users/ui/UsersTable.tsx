"use client"

import { useEffect, useState } from "react"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

type UsersResponse = {
  data: UserRow[]
  total: number
  page: number
  pageSize: number
}

export function UsersTable() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadUsers() {
      try {
        const response = await fetch("/users")

        if (!response.ok) {
          throw new Error("Failed to load users.")
        }

        const payload = (await response.json()) as UsersResponse

        if (mounted) {
          setUsers(payload.data)
        }
      } catch (fetchError) {
        if (mounted) {
          setError(
            fetchError instanceof Error ? fetchError.message : "Unexpected error."
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadUsers()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

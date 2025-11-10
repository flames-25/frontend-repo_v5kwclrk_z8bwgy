export const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPost(path, data) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `POST ${path} failed: ${res.status}`)
  }
  return res.json()
}

export function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export function formatCityState(city?: string | null, state?: string | null) {
  if (city && state) {
    return `${city}, ${state}`
  }

  if (city) {
    return city
  }

  if (state) {
    return state
  }

  return "-"
}

import { UnitSystem } from "./metrics"

export const formatDistance = (meters: number, unitSystem: UnitSystem = "metric") => {
  if (unitSystem === "imperial") {
    const miles = meters / 1609.34
    if (miles >= 1) {
      return `${miles.toFixed(1)} mi`
    }
    const feet = meters * 3.28084
    return `${feet.toFixed(0)} ft`
  }
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${meters.toFixed(0)} m`
}

export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const formatPace = (distance: number, time: number, unitSystem: UnitSystem = "metric") => {
  if (unitSystem === "imperial") {
    const paceSeconds = time / (distance / 1609.34) // per mile
    const minutes = Math.floor(paceSeconds / 60)
    const seconds = Math.floor(paceSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}/mi`
  }
  
  const paceSeconds = time / (distance / 1000) // per km
  const minutes = Math.floor(paceSeconds / 60)
  const seconds = Math.floor(paceSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}/km`
}

export const formatSpeed = (metersPerSecond: number, unitSystem: UnitSystem = "metric") => {
  if (unitSystem === "imperial") {
    const mph = metersPerSecond * 2.237
    return `${mph.toFixed(1)} mph`
  }
  
  const kmh = metersPerSecond * 3.6
  return `${kmh.toFixed(1)} km/h`
}

export const formatElevation = (meters: number, unitSystem: UnitSystem = "metric") => {
  if (unitSystem === "imperial") {
    const feet = meters * 3.28084
    return `${feet.toFixed(0)} ft`
  }
  return `${meters.toFixed(0)}m`
}

export const formatDate = (dateString: string, dateFormat: string = "%m/%d/%Y") => {
  const date = new Date(dateString)
  const now = new Date()
  
  // Set times to midnight for date-only comparison in local time
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (targetDate.getTime() === today.getTime()) {
    return "Today"
  }
  
  if (targetDate.getTime() === yesterday.getTime()) {
    return "Yesterday"
  }
  
  // Handle different date format patterns
  if (dateFormat === "%b %d, %Y") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric", 
      year: "numeric"
    })
  }
  
  // Default MM/DD/YYYY format for imperial users
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  })
}

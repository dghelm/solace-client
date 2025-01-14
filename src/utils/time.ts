import { MIN_RETRY_DELAY, RETRY_BACKOFF_FACTOR, MAX_RETRY_DELAY, NUM_BLOCKS_PER_DAY } from '../constants'

export function timeAgo(someDateInThePast: number): string {
  const difference = Date.now() - someDateInThePast
  let result = ''

  if (difference < 5 * 1000) {
    return 'just now'
  } else if (difference < 90 * 1000) {
    return 'moments ago'
  }

  //it has minutes
  if ((difference % 1000) * 3600 > 0) {
    if (Math.floor((difference / 1000 / 60) % 60) > 0) {
      const s = Math.floor((difference / 1000 / 60) % 60) == 1 ? '' : 's'
      result = `${Math.floor((difference / 1000 / 60) % 60)} min${s} `
    }
  }

  //it has hours
  if ((difference % 1000) * 3600 * 60 > 0) {
    if (Math.floor((difference / 1000 / 60 / 60) % 24) > 0) {
      const s = Math.floor((difference / 1000 / 60 / 60) % 24) == 1 ? '' : 's'
      result = `${Math.floor((difference / 1000 / 60 / 60) % 24)} hr${s}${result == '' ? '' : ','} ` + result
    }
  }

  //it has days
  if ((difference % 1000) * 3600 * 60 * 24 > 0) {
    if (Math.floor(difference / 1000 / 60 / 60 / 24) > 0) {
      const s = Math.floor(difference / 1000 / 60 / 60 / 24) == 1 ? '' : 's'
      result = `${Math.floor(difference / 1000 / 60 / 60 / 24)} day${s}${result == '' ? '' : ','} ` + result
    }
  }

  return result + ' ago'
}

export function timeToDateText(millis: number): string {
  const date = new Date(millis)
  let str = ''
  const days = date.getUTCDate() - 1
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()

  if (days > 0) {
    if (days > 1) {
      str += days + ' days'
    } else {
      str += days + ' day'
    }
  }

  if (hours > 0) {
    if (days > 0) {
      str += ', '
    }
    if (hours > 1) {
      str += hours + ' hours'
    } else {
      str += hours + ' hour'
    }
  }

  if (minutes > 0) {
    if (hours > 0) {
      str += ', '
    }
    if (minutes > 1) {
      str += minutes + ' minutes'
    } else {
      str += minutes + ' minute'
    }
  }

  if (seconds > 0) {
    if (minutes > 0) {
      str += ', '
    }
    if (seconds > 1) {
      str += seconds + ' seconds'
    } else {
      str += seconds + ' second'
    }
  }

  return str
}

export function timeToDate(millis: number): string {
  const date = new Date(millis)
  let str = ''
  const days = date.getUTCDate() - 1
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()

  if (days > 0) {
    str += days + 'd'
  }

  if (hours > 0) {
    if (days > 0) {
      str += ' '
    }
    str += hours + 'hr'
  }

  if (hours > 0) {
    str += ' '
  }
  str += minutes + 'm'

  return str
}

export const getTimeFromMillis = (millis: number): string => {
  // 1- Convert to seconds:
  let seconds = parseInt((millis / 1000).toString())
  // 2- Extract days:
  const days = parseInt((seconds / 86400).toString()) // 86400 seconds in 1 day
  seconds = seconds % 86400
  // 3- Extract hours:
  const hours = parseInt((seconds / 3600).toString()) // 3,600 seconds in 1 hour
  seconds = seconds % 3600 // seconds remaining after extracting hours
  // 4- Extract minutes:
  const minutes = parseInt((seconds / 60).toString()) // 60 seconds in 1 minute
  // 5- Keep only seconds not extracted to minutes:
  seconds = seconds % 60
  return `${days}d${hours > 0 ? ` ${hours}h` : ''}${minutes > 0 ? ` ${minutes}m` : ''}`
}

export const getDaysLeft = (expirationBlock: number, latestBlockNumber: number): number => {
  return Math.floor((expirationBlock - latestBlockNumber) / NUM_BLOCKS_PER_DAY)
}

export const getDateStringWithMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const getDateExtended = (additionalDays: number): Date => {
  const date = new Date()
  return new Date(date.setDate(date.getDate() + additionalDays))
}

export const getExpiration = (days: number): string => {
  return getDateStringWithMonthName(getDateExtended(days))
}

export const withBackoffRetries = async (f: any, retryCount = 3, jitter = 250) => {
  let nextWaitTime = MIN_RETRY_DELAY
  let i = 0
  while (true) {
    try {
      return await f()
    } catch (error) {
      i++
      if (i >= retryCount) {
        throw error
      }
      await delay(nextWaitTime + Math.floor(Math.random() * jitter))
      nextWaitTime =
        nextWaitTime === 0 ? MIN_RETRY_DELAY : Math.min(MAX_RETRY_DELAY, RETRY_BACKOFF_FACTOR * nextWaitTime)
    }
  }
}

export const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

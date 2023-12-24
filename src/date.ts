export type JSDate = globalThis.Date
export const JSDate = globalThis.Date

export const JANUARY = 1
export const FEBRUARY = 2
export const MARCH = 3
export const APRIL = 4
export const MAY = 5
export const JUNE = 6
export const JULY = 7
export const AUGUST = 8
export const SEPTEMBER = 9
export const OCTOBER = 10
export const NOVEMBER = 11
export const DECEMBER = 12

export const SUNDAY = 0
export const MONDAY = 1
export const TUESDAY = 2
export const WEDNESDAY = 3
export const THURSDAY = 4
export const FRIDAY = 5
export const SATURDAY = 6

/**
 * Timezone offset in milliseconds
 */
export type TimeOffset = number | undefined
export const UTC: TimeOffset = 0
export const LOCAL: TimeOffset = undefined

export interface DateConstructor<T extends AnyDate> {
  fromTimestamp(timestamp: number, to: TimeOffset): T
  fromJS(date: JSDate, to: TimeOffset): T

  fromEpochDays(days: EpochDays): T

  today(to: TimeOffset): T
}

type DateType<T> = DateConstructor<T extends new(...args: any[]) => (infer U extends AnyDate) ? U : never>

export function dateType<T extends Pick<DateType<T>, 'fromEpochDays'>>(t: T): T & DateType<T> {
  const c = t as any

  c.fromTimestamp ??= function (timestamp: number, to: TimeOffset) {
    return t.fromEpochDays(EpochDays.fromTimestamp(timestamp, to))
  }
  c.fromJS ??= function (date: JSDate, to: TimeOffset) {
    return t.fromEpochDays(EpochDays.fromJS(date, to))
  }
  c.today ??= function (to: TimeOffset) {
    return t.fromEpochDays(EpochDays.today(to))
  }

  return c
}

export abstract class Date<T extends Date<T>> {
  toTimestamp(to: TimeOffset): number {
    const offset = to ?? -new JSDate().getTimezoneOffset() * 60 * 1000
    return this.toEpochDays().elapsedDays * 86400 * 1000 - offset
  }

  toJS(to: TimeOffset): JSDate {
    return new JSDate(this.toTimestamp(to))
  }

  abstract toEpochDays(): EpochDays
  toGregorian(): Gregorian {
    return Gregorian.fromEpochDays(this.toEpochDays())
  }

  getWeekday(): number {
    const days = this.toEpochDays().elapsedDays
    return days >= -4 ? (days + 4) % 7 : (days + 5) % 7 + 6
  }
}
export type AnyDate = Date<AnyDate>

/**
 * Date stored as days since January 1, 1970
 */
class _EpochDays extends Date<EpochDays> {
  readonly elapsedDays: number

  constructor(elapsedDays: number) {
    super()
    this.elapsedDays = elapsedDays
  }

  static fromTimestamp(timestamp: number, to: TimeOffset): EpochDays {
    const offset = to ?? -new JSDate().getTimezoneOffset() * 60 * 1000
    return new EpochDays(Math.floor((timestamp + offset) / 86400 / 1000))
  }

  static fromJS(date: JSDate, to: TimeOffset): EpochDays {
    return EpochDays.fromTimestamp(date.getTime(), to)
  }

  static fromEpochDays(date: EpochDays): EpochDays {
    return date
  }

  static today(to: TimeOffset): EpochDays {
    return EpochDays.fromTimestamp(JSDate.now(), to)
  }

  toEpochDays(): EpochDays {
    return this
  }
}
export type EpochDays = _EpochDays
export const EpochDays = dateType(_EpochDays)

/**
 * Proleptic Gregorian Date, where year 0 is 1 BCE.
 */
export class _Gregorian extends Date<Gregorian> {
  static daysInMonth(year: number, month: number) {
    if (month === FEBRUARY && Gregorian.isLeapYear(year))
      return 29

    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1]
  }

  static isLeapYear(year: number) {
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)
  }

  readonly year: number
  readonly month: number
  readonly day: number

  constructor(year: number, month: number, day: number) {
    super()
    if (month < 1 || month > 12 || day < 1 || day > Gregorian.daysInMonth(year, month))
      throw new Error(`Invalid date ${year}-${month}-${day}`)

    this.year = year
    this.month = month
    this.day = day
  }

  static fromEpochDays(date: EpochDays): Gregorian {
    // https://stackoverflow.com/a/32158604
    const z = date.elapsedDays + 719468
    const era = Math.floor(z / 146097)
    const doe = z - era * 146097
    const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365)
    const y = yoe + era * 400
    const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100))
    const mp = Math.floor((5 * doy + 2) / 153)
    const d = doy - Math.floor((153 * mp + 2) / 5) + 1
    const m = mp + (mp < 10 ? 3 : -9)
    return new Gregorian(y + Number(m <= 2), m, d)
  }

  toJS(to: TimeOffset): JSDate {
    const offset = to ?? -new JSDate().getTimezoneOffset() * 60 * 1000
    return new JSDate(JSDate.UTC(this.year, this.month - 1, this.day) - offset)
  }

  toGregorian(): Gregorian {
    return this
  }

  toEpochDays(): EpochDays {
    // https://stackoverflow.com/a/32158604
    const y = this.month <= FEBRUARY ? this.year - 1 : this.year
    const era = Math.floor(y / 400)
    const yoe = y - era * 400
    const doy = Math.floor((153 * (this.month + (this.month > 2 ? -3 : 9)) + 2) / 5) + this.day - 1
    const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
    return new EpochDays(era * 146097 + doe - 719468)
  }
}
export type Gregorian = _Gregorian
export const Gregorian = dateType(_Gregorian)

export function CE(year: number): number {
  return year
}
export const AD = CE

export function BCE(year: number): number {
  return -year + 1
}
export const BC = BCE

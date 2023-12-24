import { describe, expect, it } from 'vitest'
import { EpochDays, Gregorian, JANUARY, JSDate, LOCAL, SUNDAY, THURSDAY, TUESDAY, UTC } from '../src'

describe('epoch days', () => {
  it('ecma conversion', () => {
    const now = JSDate.now()

    const startutc = new JSDate(now)
    startutc.setUTCHours(0)
    startutc.setUTCMinutes(0)
    startutc.setUTCSeconds(0)
    startutc.setUTCMilliseconds(0)

    const startloc = new JSDate(now)
    startloc.setHours(0)
    startloc.setMinutes(0)
    startloc.setSeconds(0)
    startloc.setMilliseconds(0)

    expect(EpochDays.fromJS(startutc, UTC).toJS(UTC)).toEqual(startutc)
    expect(EpochDays.fromJS(startloc, LOCAL).toJS(LOCAL)).toEqual(startloc)
  })
  it('the ecmascript epoch is day 0, a thursday', () => {
    expect(EpochDays.fromJS(new JSDate(0), UTC).elapsedDays).toEqual(0)
    expect(EpochDays.fromJS(new JSDate(0), UTC).getWeekday()).toEqual(THURSDAY)
  })
  it('the moonlanding is on day -165, a sunday', () => {
    expect(EpochDays.fromJS(new JSDate('July 20, 69 20:17:40 GMT+00:00'), UTC).elapsedDays).toEqual(-165)
    expect(EpochDays.fromJS(new JSDate('July 20, 69 20:17:40 GMT+00:00'), UTC).getWeekday()).toEqual(SUNDAY)
  })
  it('the year 38 problem is on day 24855, a tuesday', () => {
    expect(EpochDays.fromTimestamp(2_147_483_647 * 1000, UTC).elapsedDays).toEqual(24855)
    expect(EpochDays.fromTimestamp(2_147_483_647 * 1000, UTC).getWeekday()).toEqual(TUESDAY)
  })
})

describe('gregorian', () => {
  it('the ecmascript epoch is on 1 jan 1970', () => {
    const epoch = Gregorian.fromTimestamp(0, UTC)
    expect(epoch.year).toBe(1970)
    expect(epoch.month).toBe(JANUARY)
    expect(epoch.day).toBe(1)
  })
  it('today\'s date', () => {
    const now = new JSDate(JSDate.now())
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()

    const today = Gregorian.today(LOCAL)
    expect(today.year).toBe(year)
    expect(today.month).toBe(month)
    expect(today.day).toBe(day)
  })
})

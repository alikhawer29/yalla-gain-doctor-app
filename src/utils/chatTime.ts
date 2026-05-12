import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import customParseFormat from "dayjs/plugin/customParseFormat"

dayjs.extend(utc)
dayjs.extend(customParseFormat)

/** Normalize clock-only strings to HH:mm:ss (24h) for ISO construction. */
function normalizeClockToHms(clock: string): string | null {
    const t = clock?.trim() ?? ""
    if (!t) return "00:00:00"
    if (/^\d{4}-\d{2}-\d{2}T/.test(t)) return null

    const withAmPm = dayjs(t, ["hh:mm A", "h:mm A", "hh:mm:ss A", "h:mm:ss A"], true)
    if (withAmPm.isValid()) return withAmPm.format("HH:mm:ss")

    const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    if (m) {
        const h = String(Math.min(23, Number(m[1]))).padStart(2, "0")
        const mm = m[2].padStart(2, "0")
        const s = (m[3] ?? "00").padStart(2, "0")
        return `${h}:${mm}:${s}`
    }
    return null
}

/** If string is ISO-like but has no timezone, treat as UTC (append Z). */
function asUtcIsoString(s: string): string {
    const t = s.trim()
    if (!t.includes("T")) return t
    if (/[zZ]$/.test(t) || /[+\-]\d{2}:?\d{2}$/.test(t)) return t
    return `${t}Z`
}

/**
 * Parse chat `date` + `time` from the API as UTC and return a UTC dayjs instance.
 * Falls back to invalid dayjs if parsing fails (callers use .isValid()).
 */
export function parseChatUtc(
    dateInput?: string | null,
    timeInput?: string | null,
): dayjs.Dayjs {
    const dateStr = (dateInput ?? "").trim()
    const timeStr = (timeInput ?? "").trim()

    if (timeStr.includes("T")) {
        const iso = dayjs.utc(asUtcIsoString(timeStr))
        if (iso.isValid()) return iso
    }

    if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
        const iso = dayjs.utc(asUtcIsoString(dateStr))
        if (iso.isValid()) return iso
    }

    if (!dateStr && timeStr) {
        const iso = dayjs.utc(asUtcIsoString(timeStr))
        if (iso.isValid()) return iso
    }

    const hms = timeStr ? normalizeClockToHms(timeStr) : "00:00:00"

    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && hms) {
        const combined = dayjs.utc(`${dateStr}T${hms}`, "YYYY-MM-DDTHH:mm:ss", true)
        if (combined.isValid()) return combined
    }

    if (dateStr && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr) && hms) {
        const us = dayjs.utc(dateStr, "M/D/YYYY", true)
        const eu = dayjs.utc(dateStr, "D/M/YYYY", true)
        const base = us.isValid() ? us : eu.isValid() ? eu : null
        if (base?.isValid()) {
            const [hh, mm, ss] = hms.split(":").map(n => Number(n))
            return base.hour(hh).minute(mm).second(ss).millisecond(0)
        }
    }

    if (dateStr && hms) {
        const guess = dayjs.utc(`${dateStr}T${hms}`)
        if (guess.isValid()) return guess
    }

    return dayjs(new Date(NaN))
}

export function formatChatTimeLocal(
    dateStr?: string | null,
    timeStr?: string | null,
    fallback?: string,
): string {
    const parsed = parseChatUtc(dateStr, timeStr)
    if (!parsed.isValid()) return fallback ?? timeStr ?? ""
    return parsed.local().format("hh:mm A")
}

export function formatChatDateSeparatorLocal(
    dateStr?: string | null,
    timeStr?: string | null,
    fallback?: string,
): string {
    const parsed = parseChatUtc(dateStr, timeStr)
    if (!parsed.isValid()) return fallback ?? dateStr ?? ""
    return parsed.local().format("MMMM DD, YYYY")
}

/** Local calendar day key for grouping messages (YYYY-MM-DD in device timezone). */
export function chatMessageLocalDayKey(
    dateStr?: string | null,
    timeStr?: string | null,
): string {
    const parsed = parseChatUtc(dateStr, timeStr)
    if (!parsed.isValid()) return `${dateStr ?? ""}|${timeStr ?? ""}`
    return parsed.local().format("YYYY-MM-DD")
}

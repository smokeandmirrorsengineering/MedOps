import type { LifecycleRecord } from "./types";
export function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function utcTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
export function dhakaDate(at: string): string { return new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Dhaka",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(at)); }
export type CoverageState = "Not recorded / Coverage unknown" | "Incomplete dates / Coverage unknown" | "Not yet effective" | "Active" | "Expiring soon" | "Expired";
export function coverage(start: string, end: string, today: string, windowDays = 90): {status: CoverageState; days: number | null} {
  if (!validDate(today) || !Number.isInteger(windowDays) || windowDays < 0) throw Error("Invalid coverage clock/window");
  if (!start && !end) return {status:"Not recorded / Coverage unknown",days:null};
  if (!validDate(start) || !validDate(end) || start > end) return {status:"Incomplete dates / Coverage unknown",days:null};
  const days = Math.round((Date.parse(end)-Date.parse(today))/86400000);
  return {status: today < start ? "Not yet effective" : days < 0 ? "Expired" : days <= windowDays ? "Expiring soon" : "Active", days};
}
export function assetCoverage(record: LifecycleRecord, today: string, days=90) { return {warranty:coverage(record.warrantyStart,record.warrantyEnd,today,days),contract:coverage(record.contractStart,record.contractEnd,today,days)}; }
export function money(amount: string, currency = "BDT") { return new Intl.NumberFormat("en-BD",{style:"currency",currency,minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(amount)); }
export const validAmount = (value: unknown): value is string => typeof value === "string" && /^(0|[1-9]\d{0,11})(\.\d{1,2})?$/.test(value) && Number(value) > 0;

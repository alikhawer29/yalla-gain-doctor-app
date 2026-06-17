/**
 * Per-country phone digit rules (local subscriber number only, no country prefix).
 * Source: ITU-T E.164 / national numbering plans.
 * Fallback for unlisted countries: 8–15 digits.
 */
export interface PhoneRule {
  min: number;
  max: number;
}

const FALLBACK: PhoneRule = { min: 8, max: 15 };

const PHONE_RULES: Record<string, PhoneRule> = {
  // Middle East & North Africa
  AE: { min: 9, max: 9 }, // UAE
  SA: { min: 9, max: 9 }, // Saudi Arabia
  KW: { min: 8, max: 8 }, // Kuwait
  QA: { min: 8, max: 8 }, // Qatar
  OM: { min: 8, max: 8 }, // Oman
  BH: { min: 8, max: 8 }, // Bahrain
  JO: { min: 9, max: 9 }, // Jordan
  LB: { min: 8, max: 8 }, // Lebanon
  IQ: { min: 10, max: 10 }, // Iraq
  IR: { min: 10, max: 10 }, // Iran
  YE: { min: 9, max: 9 }, // Yemen
  SY: { min: 9, max: 9 }, // Syria
  EG: { min: 10, max: 10 }, // Egypt
  LY: { min: 9, max: 9 }, // Libya
  TN: { min: 8, max: 8 }, // Tunisia
  DZ: { min: 9, max: 9 }, // Algeria
  MA: { min: 9, max: 9 }, // Morocco

  // South Asia
  PK: { min: 10, max: 10 }, // Pakistan
  IN: { min: 10, max: 10 }, // India
  BD: { min: 10, max: 10 }, // Bangladesh
  LK: { min: 9, max: 9 }, // Sri Lanka
  NP: { min: 10, max: 10 }, // Nepal
  AF: { min: 9, max: 9 }, // Afghanistan

  // East & South-East Asia
  CN: { min: 11, max: 11 }, // China
  JP: { min: 10, max: 11 }, // Japan
  KR: { min: 10, max: 11 }, // South Korea
  ID: { min: 9, max: 12 }, // Indonesia
  PH: { min: 10, max: 10 }, // Philippines
  MY: { min: 9, max: 10 }, // Malaysia
  SG: { min: 8, max: 8 }, // Singapore
  TH: { min: 9, max: 9 }, // Thailand
  VN: { min: 9, max: 10 }, // Vietnam
  MM: { min: 8, max: 9 }, // Myanmar
  KH: { min: 8, max: 9 }, // Cambodia
  HK: { min: 8, max: 8 }, // Hong Kong

  // Europe
  GB: { min: 10, max: 11 }, // United Kingdom
  DE: { min: 10, max: 11 }, // Germany
  FR: { min: 9, max: 9 }, // France
  IT: { min: 9, max: 10 }, // Italy
  ES: { min: 9, max: 9 }, // Spain
  PT: { min: 9, max: 9 }, // Portugal
  NL: { min: 9, max: 9 }, // Netherlands
  BE: { min: 9, max: 9 }, // Belgium
  CH: { min: 9, max: 9 }, // Switzerland
  AT: { min: 10, max: 11 }, // Austria
  SE: { min: 9, max: 10 }, // Sweden
  NO: { min: 8, max: 8 }, // Norway
  DK: { min: 8, max: 8 }, // Denmark
  FI: { min: 9, max: 10 }, // Finland
  PL: { min: 9, max: 9 }, // Poland
  RU: { min: 10, max: 10 }, // Russia
  UA: { min: 9, max: 9 }, // Ukraine
  RO: { min: 9, max: 10 }, // Romania
  GR: { min: 10, max: 10 }, // Greece
  CZ: { min: 9, max: 9 }, // Czech Republic
  HU: { min: 9, max: 9 }, // Hungary
  SK: { min: 9, max: 9 }, // Slovakia
  BG: { min: 9, max: 9 }, // Bulgaria
  HR: { min: 8, max: 9 }, // Croatia
  TR: { min: 10, max: 10 }, // Turkey
  IE: { min: 9, max: 10 }, // Ireland

  // Americas
  US: { min: 10, max: 10 }, // United States
  CA: { min: 10, max: 10 }, // Canada
  MX: { min: 10, max: 10 }, // Mexico
  BR: { min: 10, max: 11 }, // Brazil
  AR: { min: 10, max: 10 }, // Argentina
  CO: { min: 10, max: 10 }, // Colombia
  CL: { min: 9, max: 9 }, // Chile
  PE: { min: 9, max: 9 }, // Peru

  // Africa
  NG: { min: 10, max: 10 }, // Nigeria
  ZA: { min: 9, max: 9 }, // South Africa
  KE: { min: 9, max: 9 }, // Kenya
  ET: { min: 9, max: 9 }, // Ethiopia
  TZ: { min: 9, max: 9 }, // Tanzania
  GH: { min: 9, max: 9 }, // Ghana
  SD: { min: 9, max: 9 }, // Sudan
  SN: { min: 9, max: 9 }, // Senegal
  CI: { min: 10, max: 10 }, // Ivory Coast

  // Oceania
  AU: { min: 9, max: 9 }, // Australia
  NZ: { min: 8, max: 9 }, // New Zealand
};

/** Returns the digit rule for a given ISO-3166-1 alpha-2 country code. */
export function getPhoneRules(countryCode?: string | null): PhoneRule {
  if (!countryCode) return FALLBACK;
  return PHONE_RULES[countryCode.toUpperCase()] ?? FALLBACK;
}

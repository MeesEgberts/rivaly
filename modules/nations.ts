/**
 * Landcodes zoals de sport ze gebruikt (IOC/FIFA, drie letters) omgezet
 * naar een vlag-emoji. Rechtenvrij en zonder afbeeldingen, dus overal
 * direct te tonen. Een onbekende code krijgt geen vlag; de app toont dan de
 * code zelf.
 */

/** IOC/FIFA-code → ISO 3166-1 alpha-2. */
const ISO_BY_CODE: Record<string, string> = {
  ALB: "AL", ALG: "DZ", AND: "AD", ARG: "AR", ARM: "AM", AUS: "AU", AUT: "AT",
  AZE: "AZ", BEL: "BE", BIH: "BA", BLR: "BY", BOL: "BO", BRA: "BR", BUL: "BG",
  CAN: "CA", CHI: "CL", CHN: "CN", CIV: "CI", CMR: "CM", COL: "CO", CRC: "CR",
  CRO: "HR", CUB: "CU", CYP: "CY", CZE: "CZ", DEN: "DK", ECU: "EC", EGY: "EG",
  ERI: "ER", ESP: "ES", EST: "EE", ETH: "ET", FIN: "FI", FRA: "FR", GEO: "GE",
  GER: "DE", GHA: "GH", GBR: "GB", GRE: "GR", HKG: "HK", HUN: "HU", IND: "IN",
  IDN: "ID", IRL: "IE", IRN: "IR", ISL: "IS", ISR: "IL", ITA: "IT", JAM: "JM",
  JPN: "JP", KAZ: "KZ", KEN: "KE", KOR: "KR", KSA: "SA", LAT: "LV", LIE: "LI",
  LTU: "LT", LUX: "LU", MAR: "MA", MAS: "MY", MDA: "MD", MEX: "MX", MGL: "MN",
  MKD: "MK", MLT: "MT", MNE: "ME", NED: "NL", NGA: "NG", NOR: "NO", NZL: "NZ",
  PAK: "PK", PAN: "PA", PAR: "PY", PER: "PE", PHI: "PH", POL: "PL", POR: "PT",
  QAT: "QA", ROU: "RO", RSA: "ZA", RUS: "RU", RWA: "RW", SEN: "SN", SGP: "SG",
  SLO: "SI", SVN: "SI", SRB: "RS", SUI: "CH", SVK: "SK", SWE: "SE", THA: "TH",
  TPE: "TW", TUN: "TN", TUR: "TR", UAE: "AE", UGA: "UG", UKR: "UA", URU: "UY",
  USA: "US", UZB: "UZ", VEN: "VE", VIE: "VN",
};

/** Landen zonder eigen ISO-code maar mét een vlag-emoji (Britse landsdelen). */
const SPECIAL_FLAGS: Record<string, string> = {
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

const REGIONAL_INDICATOR_A = 0x1f1e6;

/** "NED" → "🇳🇱"; `null` voor codes die geen land zijn, zoals "AJA". */
export function flagEmoji(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }

  const upper = code.toUpperCase();
  const special = SPECIAL_FLAGS[upper];

  if (special) {
    return special;
  }

  const iso = ISO_BY_CODE[upper];

  if (!iso) {
    return null;
  }

  return String.fromCodePoint(
    ...[...iso].map(
      (letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - 65,
    ),
  );
}

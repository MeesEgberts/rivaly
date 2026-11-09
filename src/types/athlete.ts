/** Een atleet zoals de app hem toont: naam, korte naam en landcode. */
export interface AthleteInfo {
  id: string;
  name: string;
  shortName: string;
  code: string | null;
}

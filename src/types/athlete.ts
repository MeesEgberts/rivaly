/** Een atleet zoals de app hem toont: naam, korte naam, landcode en foto. */
export interface AthleteInfo {
  id: string;
  name: string;
  shortName: string;
  code: string | null;
  imageUrl: string | null;
}

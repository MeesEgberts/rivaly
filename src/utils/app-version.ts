import Constants from "expo-constants";

/** De versie uit app.json, bijv. "1.0.0". */
export function appVersion(): string {
  return Constants.expoConfig?.version ?? "Onbekend";
}

import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";

import { SPORT_GLYPHS } from "@/constants/sport-glyphs";
import { moduleIcon } from "@/utils/sport-icon";

interface Props {
  moduleKey: string;
  size: number;
  color: string;
}

/** Het icoon van een sport: een eigen tekening als die er is, anders het SF Symbol. */
export function SportIcon({ moduleKey, size, color }: Props) {
  const glyph = SPORT_GLYPHS[moduleKey];

  if (glyph) {
    // Iets groter dan een SF Symbol, zodat de tekening even zwaar oogt.
    const glyphSize = size * 1.25;

    return (
      <Image
        source={glyph}
        style={{ width: glyphSize, height: glyphSize }}
        tintColor={color}
        contentFit="contain"
        accessible={false}
      />
    );
  }

  return (
    <SymbolView name={moduleIcon(moduleKey)} size={size} tintColor={color} />
  );
}

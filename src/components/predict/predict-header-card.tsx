import { StyleSheet, Text, View } from "react-native";

import { InfoChip } from "@/components/cards/info-chip";
import { QuestionVisual } from "@/components/cards/question-visual";
import { StatusPill } from "@/components/cards/status-pill";
import { useAppColors } from "@/hooks/use-app-colors";
import { useNow } from "@/hooks/use-now";
import type { FixtureDetail } from "@/types/fixture-detail";
import { describeOrigin, detailChips } from "@/utils/fixture-text";
import { formatMoment } from "@/utils/prediction-cards";

interface Props {
  fixture: FixtureDetail;
  isOpen: boolean;
  /** Titel als het onderdeel geen label heeft. */
  fallbackTitle?: string;
  /** Extra regel onderaan, bijv. de huidige uitslag in het beheerscherm. */
  note?: string;
}

/**
 * Kop van een voorspelvraag: beeld en vraag, het parcours als losse labels
 * en hoe lang je nog hebt.
 */
export function PredictHeaderCard({
  fixture,
  isOpen,
  fallbackTitle = "Voorspelling",
  note,
}: Props) {
  const colors = useAppColors();
  const now = useNow();
  const chips = detailChips(fixture.details);

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <QuestionVisual
          type={fixture.type}
          details={fixture.details}
          size={48}
        />
        <View style={styles.headerText}>
          <Text
            numberOfLines={1}
            style={[styles.origin, { color: colors.secondaryLabel }]}
          >
            {describeOrigin(fixture).toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: colors.label }]}>
            {fixture.label ?? fallbackTitle}
          </Text>
        </View>
      </View>

      {chips.length > 0 ? (
        <View style={styles.chips}>
          {chips.map((chip) => (
            <InfoChip key={chip.icon} icon={chip.icon} text={chip.text} />
          ))}
        </View>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.separator }]}>
        <StatusPill
          status={isOpen ? "todo" : "locked"}
          locksAt={fixture.locksAt}
          now={now}
        />
        <Text style={[styles.moment, { color: colors.tertiaryLabel }]}>
          {formatMoment(fixture.locksAt)}
        </Text>
      </View>

      {note ? (
        <Text style={[styles.note, { color: colors.secondaryLabel }]}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerText: { flex: 1, gap: 2 },
  origin: { fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  title: { fontSize: 24, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  moment: { fontSize: 13, fontVariant: ["tabular-nums"] },
  note: { fontSize: 14 },
});

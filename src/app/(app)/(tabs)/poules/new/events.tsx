import { useQuery } from "convex/react";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import { LoadingScreen } from "@/components/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { useNewPouleDraft } from "@/hooks/use-new-poule-draft";
import {
  catalogSports,
  catalogSubtitle,
  filterCatalog,
  sportIcon,
} from "@/utils/event-catalog";

/**
 * Wedstrijden en toernooien kiezen voor een nieuwe poule: zoeken via de
 * zoekbalk in de header, filteren op sport via het menu rechtsboven.
 */
export default function ChooseEventsScreen() {
  const catalog = useQuery(api.events.catalog);
  const { selectedEventIds, toggleEvent } = useNewPouleDraft();

  const [search, setSearch] = useState("");
  const [sportKey, setSportKey] = useState<string | null>(null);

  const sports = useMemo(() => catalogSports(catalog ?? []), [catalog]);

  const results = useMemo(
    () => filterCatalog(catalog ?? [], search, sportKey),
    [catalog, search, sportKey],
  );

  if (catalog === undefined) {
    return <LoadingScreen />;
  }

  const activeSport = sports.find((sport) => sport.key === sportKey) ?? null;

  return (
    <>
      <Stack.SearchBar
        placeholder="Zoek wedstrijd of toernooi"
        hideWhenScrolling={false}
        onChangeText={(event) => setSearch(event.nativeEvent.text)}
        onCancelButtonPress={() => setSearch("")}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={
            activeSport
              ? "line.3.horizontal.decrease.circle.fill"
              : "line.3.horizontal.decrease.circle"
          }
          accessibilityLabel="Filter op sport"
        >
          <Stack.Toolbar.MenuAction
            icon="sportscourt"
            isOn={sportKey === null}
            onPress={() => setSportKey(null)}
          >
            Alle sporten
          </Stack.Toolbar.MenuAction>
          {sports.map((sport) => (
            <Stack.Toolbar.MenuAction
              key={sport.key}
              icon={sport.icon}
              isOn={sportKey === sport.key}
              onPress={() => setSportKey(sport.key)}
            >
              {sport.name}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      {results.length === 0 ? (
        <EmptyState
          icon="magnifyingglass"
          title="Niets gevonden"
          description={
            catalog.length === 0
              ? "Er staan nog geen wedstrijden of toernooien klaar."
              : "Probeer een andere zoekterm of sport."
          }
        />
      ) : (
        <Screen>
          <Section title={activeSport?.name}>
            {results.map((event) => (
              <NavRow
                key={event._id}
                icon={sportIcon(event)}
                title={event.name}
                subtitle={catalogSubtitle(event)}
                selected={selectedEventIds.has(event._id)}
                onPress={() => toggleEvent(event._id)}
              />
            ))}
          </Section>
        </Screen>
      )}
    </>
  );
}

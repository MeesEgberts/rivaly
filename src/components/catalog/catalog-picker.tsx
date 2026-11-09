import { useQuery } from "convex/react";
import { Stack } from "expo-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { EventMark } from "@/components/event/event-mark";
import { ListSkeleton } from "@/components/skeleton/list-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import {
  catalogSeries,
  catalogSports,
  catalogSubtitle,
  filterCatalog,
  seriesSubtitle,
  sportIcon,
} from "@/utils/event-catalog";

interface Props {
  selectedEventIds: Set<Id<"events">>;
  toggleEvent: (eventId: Id<"events">) => void;
  toggleEvents: (eventIds: Id<"events">[]) => void;
  /** Al in de poule: niet nog eens kiesbaar. */
  excludeEventIds?: Set<Id<"events">>;
  /** Extra knoppen rechts in de navigatiebalk, naast het sportfilter. */
  toolbarItems?: ReactNode;
}

/**
 * Wedstrijden en toernooien kiezen uit de catalogus: zoeken via de
 * zoekbalk in de header, filteren op sport via het menu rechtsboven. Een
 * reeks (bijv. alle monumenten) kies je in één tik. Zoekbalk en menu staan
 * er vanaf de eerste render, zodat ze niet na de overgang inspringen.
 */
export function CatalogPicker({
  selectedEventIds,
  toggleEvent,
  toggleEvents,
  excludeEventIds,
  toolbarItems,
}: Props) {
  const catalog = useQuery(api.events.catalog);

  const [search, setSearch] = useState("");
  const [sportKey, setSportKey] = useState<string | null>(null);

  const available = useMemo(
    () => (catalog ?? []).filter((event) => !excludeEventIds?.has(event._id)),
    [catalog, excludeEventIds],
  );

  const sports = useMemo(() => catalogSports(available), [available]);

  const results = useMemo(
    () => filterCatalog(available, search, sportKey),
    [available, search, sportKey],
  );

  // Reeksen alleen zonder zoekterm, en binnen het sportfilter.
  const series = useMemo(() => {
    if (search.trim().length > 0) {
      return [];
    }

    return catalogSeries(available).filter(
      (item) => sportKey === null || item.moduleKey === sportKey,
    );
  }, [available, search, sportKey]);

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
            icon="square.grid.2x2"
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
        {toolbarItems}
      </Stack.Toolbar>

      {/* Zoekbalk en filter staan er al tijdens het laden. */}
      {catalog === undefined ? (
        <ListSkeleton sections={[5, 6]} />
      ) : results.length === 0 ? (
        <EmptyState
          icon="magnifyingglass"
          title="Niets gevonden"
          description={
            available.length === 0
              ? "Er staan geen (nieuwe) wedstrijden of toernooien klaar."
              : "Probeer een andere zoekterm of sport."
          }
        />
      ) : (
        <Screen>
          {series.length > 0 ? (
            <Section title="Reeksen">
              {series.map((item) => (
                <NavRow
                  key={item.key}
                  icon={item.icon}
                  title={item.name}
                  subtitle={seriesSubtitle(item)}
                  selected={item.eventIds.every((eventId) =>
                    selectedEventIds.has(eventId),
                  )}
                  onPress={() => toggleEvents(item.eventIds)}
                />
              ))}
            </Section>
          ) : null}
          <Section
            title={
              activeSport?.name ?? (series.length > 0 ? "Alles" : undefined)
            }
          >
            {results.map((event) => (
              <NavRow
                key={event._id}
                icon={sportIcon(event)}
                // Altijd een beeldmerk van dezelfde maat, zodat de namen
                // onder elkaar staan: logo, foto of het sporticoon.
                leading={
                  <EventMark
                    logoUrl={event.logoUrl}
                    imageUrl={event.imageUrl}
                    moduleKey={event.moduleKey}
                    size={32}
                  />
                }
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

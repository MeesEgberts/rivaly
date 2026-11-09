import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { StyleSheet, View } from "react-native";

import type { Id } from "@convex/_generated/dataModel";
import { EventTabContent } from "@/components/event/event-tab-content";
import { EventTabPicker } from "@/components/event/event-tab-picker";
import { eventTabs, type EventTabKey } from "@/utils/event-tabs";
import { LoadingScreen } from "@/components/loading-screen";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";

/**
 * Een evenement invullen en volgen. De tabs volgen uit de fases: een
 * toernooi krijgt Groepen en Schema, een competitie Speelrondes.
 */
export default function EventScreen() {
  const { eventId, tab: initialTab } = useLocalSearchParams<{
    eventId: Id<"events">;
    tab?: EventTabKey;
  }>();
  const colors = useAppColors();
  const headerHeight = useHeaderHeight();
  const { event, fixtures, isLoading } = useEventData(eventId);
  const [selectedTab, setSelectedTab] = useState<EventTabKey | null>(
    initialTab ?? null,
  );

  const tabs = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return eventTabs(event.stages, fixtures);
  }, [event, fixtures]);

  if (isLoading || !event) {
    return <LoadingScreen />;
  }

  const activeTab =
    tabs.find((tab) => tab.key === selectedTab)?.key ?? tabs[0]?.key ?? null;

  return (
    <>
      <Stack.Screen options={{ title: event.name }} />
      {/* De navigatiebalk ligt over de inhoud; begin eronder. */}
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: headerHeight },
        ]}
      >
        {tabs.length > 1 && activeTab ? (
          <EventTabPicker
            tabs={tabs}
            selected={activeTab}
            onSelect={setSelectedTab}
          />
        ) : null}
        {activeTab ? (
          <EventTabContent eventId={eventId} tab={activeTab} />
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

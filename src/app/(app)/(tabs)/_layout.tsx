import { NativeTabs } from "expo-router/native-tabs";

export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Voorspellen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="target" md="target" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="poules">
        <NativeTabs.Trigger.Label>Poules</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="trophy" md="emoji_events" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Instellingen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

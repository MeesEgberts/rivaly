import { Redirect, useLocalSearchParams } from "expo-router";

/** Deep link `rivaly://j/<code>` en later `https://rivaly.app/j/<code>`. */
export default function InviteLinkScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return <Redirect href={{ pathname: "/poules/join", params: { code } }} />;
}

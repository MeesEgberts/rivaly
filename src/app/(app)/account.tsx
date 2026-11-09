import { UserProfileView } from "@clerk/expo/native-components";
import { router } from "expo-router";

/**
 * Accountbeheer via Clerk's native UserProfileView: e-mail, wachtwoord,
 * beveiliging en sessies. Staat buiten de tabs-groep zodat de tabbalk
 * verdwijnt. De view houdt zijn eigen navigatiebalk; de terugknop van de
 * view popt deze route.
 */
export default function AccountScreen() {
  return (
    <UserProfileView
      isDismissible={false}
      onHostBack={() => router.back()}
      style={{ flex: 1 }}
    />
  );
}

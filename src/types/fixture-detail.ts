import type { useQuery } from "convex/react";

import type { api } from "@convex/_generated/api";

export type FixtureDetail = NonNullable<
  ReturnType<typeof useQuery<typeof api.events.fixture>>
>;

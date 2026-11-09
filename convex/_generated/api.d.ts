/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as athletes from "../athletes.js";
import type * as customEvents from "../customEvents.js";
import type * as events from "../events.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_athletes from "../lib/athletes.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_cyclingRace from "../lib/cyclingRace.js";
import type * as lib_cyclingSeedData from "../lib/cyclingSeedData.js";
import type * as lib_deletePoule from "../lib/deletePoule.js";
import type * as lib_eventPreview from "../lib/eventPreview.js";
import type * as lib_inviteCode from "../lib/inviteCode.js";
import type * as lib_reveal from "../lib/reveal.js";
import type * as lib_slug from "../lib/slug.js";
import type * as lib_standings from "../lib/standings.js";
import type * as lib_userEvents from "../lib/userEvents.js";
import type * as poules from "../poules.js";
import type * as predictions from "../predictions.js";
import type * as scoring from "../scoring.js";
import type * as seed from "../seed.js";
import type * as seedCycling from "../seedCycling.js";
import type * as seedImages from "../seedImages.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  athletes: typeof athletes;
  customEvents: typeof customEvents;
  events: typeof events;
  "lib/access": typeof lib_access;
  "lib/athletes": typeof lib_athletes;
  "lib/auth": typeof lib_auth;
  "lib/cyclingRace": typeof lib_cyclingRace;
  "lib/cyclingSeedData": typeof lib_cyclingSeedData;
  "lib/deletePoule": typeof lib_deletePoule;
  "lib/eventPreview": typeof lib_eventPreview;
  "lib/inviteCode": typeof lib_inviteCode;
  "lib/reveal": typeof lib_reveal;
  "lib/slug": typeof lib_slug;
  "lib/standings": typeof lib_standings;
  "lib/userEvents": typeof lib_userEvents;
  poules: typeof poules;
  predictions: typeof predictions;
  scoring: typeof scoring;
  seed: typeof seed;
  seedCycling: typeof seedCycling;
  seedImages: typeof seedImages;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

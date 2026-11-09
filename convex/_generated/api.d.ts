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
import type * as events from "../events.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_athletes from "../lib/athletes.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_cyclingSeedData from "../lib/cyclingSeedData.js";
import type * as lib_inviteCode from "../lib/inviteCode.js";
import type * as lib_standings from "../lib/standings.js";
import type * as lib_userEvents from "../lib/userEvents.js";
import type * as poules from "../poules.js";
import type * as predictions from "../predictions.js";
import type * as scoring from "../scoring.js";
import type * as seed from "../seed.js";
import type * as seedCycling from "../seedCycling.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  athletes: typeof athletes;
  events: typeof events;
  "lib/access": typeof lib_access;
  "lib/athletes": typeof lib_athletes;
  "lib/auth": typeof lib_auth;
  "lib/cyclingSeedData": typeof lib_cyclingSeedData;
  "lib/inviteCode": typeof lib_inviteCode;
  "lib/standings": typeof lib_standings;
  "lib/userEvents": typeof lib_userEvents;
  poules: typeof poules;
  predictions: typeof predictions;
  scoring: typeof scoring;
  seed: typeof seed;
  seedCycling: typeof seedCycling;
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

# Rivaly — Ontwerp van het platform

> Versie 0.1 · 8 november 2026 · Werkdocument, bedoeld om samen aan te scherpen.

Rivaly is een app waarmee vrienden, collega's en families **poules** maken op
sportwedstrijden en toernooien. Een poule kan over één wedstrijd gaan, over
een heel toernooi, of over een combinatie van evenementen uit verschillende
sporten (zoals de Olympische Spelen). Elke sport heeft zijn eigen weergave
(toernooischema, groepstabellen, medaillespiegel), maar het aanmaken van een
poule en het invullen van voorspellingen moet overal even eenvoudig voelen.

---

## 1. Uitgangspunten

1. **Poule aanmaken in minder dan een minuut.** Naam → wedstrijden kiezen →
   link delen. Alles daarna is optioneel.
2. **Eén keer voorspellen.** Zit je in drie poules op hetzelfde toernooi, dan
   vul je je voorspellingen één keer in. Elke poule rekent ze met eigen regels
   om naar punten.
3. **Sporten zijn modules, voorspellingen zijn primitieven.** Een nieuwe sport
   toevoegen betekent nooit een nieuwe scoring-engine of nieuwe database-
   tabellen bouwen. Alleen data, presets en een eigen weergave.
4. **Alleen iOS en Android, en écht native.** Geen webversie. Het doel is dat
   een lijst, formulier of tabbalk er op elk platform uitziet zoals gebruikers
   daar gewend zijn. Het middel is `@expo/ui` (SwiftUI op iOS, Jetpack Compose
   op Android), zo veel mogelijk; waar dat niet kan, kiezen we het alternatief
   dat het native gevoel het minst aantast.
5. **Realtime.** Convex pusht nieuwe uitslagen en standen direct naar
   iedereen in de poule. Dat is het "samen kijken"-gevoel.

---

## 2. Kernbegrippen

| Begrip | Betekenis | Voorbeeld |
| --- | --- | --- |
| **Poule** | Sociale container: een groep mensen, een naam, een uitnodigingscode en scoringsregels. | "Familie Egberts EK-poule" |
| **Evenement** (event) | Een competitie of toernooi uit de catalogus of zelf aangemaakt. Hoort bij één sportmodule. | "EK voetbal 2028", "WK Afstanden schaatsen" |
| **Fase** (stage) | Een deel van een evenement dat op zijn eigen manier wordt weergegeven. | "Groepsfase", "Achtste finales", "Dag 3", "1500m mannen" |
| **Onderdeel** (fixture) | Het kleinste ding waar je iets over voorspelt. Heeft een type, een sluitingstijd en later een uitslag. | Wedstrijd NL–BEL, podium 1500m, bonusvraag "Wie wordt topscorer?" |
| **Deelnemer** (participant) | Team, land of sporter binnen een evenement. | Nederland, Jutta Leerdam |
| **Voorspelling** | Wat een gebruiker invult op één onderdeel. Eén per gebruiker per onderdeel. | 2–1, [Leerdam, Kok, Golikova] |
| **Score** | Punten van een gebruiker op een onderdeel binnen een poule. | 5 punten (exacte uitslag) |
| **Stand** | Totaal per gebruiker per poule, met rang. | Mees, 134 punten, 2e |
| **Module** | Sportspecifieke bundel: welke onderdeeltypes, standaardregels, templates en UI. | `football`, `speedskating`, `multisport` |

Een poule bevat één of meer evenementen. Een evenement kan in veel poules
zitten. Voorspellingen hangen aan de gebruiker en het onderdeel, niet aan de
poule. Scores en standen hangen wél aan de poule.

```
Poule ──< PouleEvent >── Evenement ──< Fase ──< Onderdeel
  │                                               │
  └──< Lid (gebruiker)                            └──< Voorspelling (per gebruiker)

Score  = f(voorspelling, uitslag, regels van de poule)
Stand  = Σ scores per gebruiker per poule
```

---

## 3. Het kerninzicht: vier voorspellingstypes

Alle sporten blijken te bestaan uit een handvol voorspellingsvormen. Als we die
generiek bouwen (invoerscherm, validatie, scoring), hoeft een sportmodule
alleen nog te zeggen *welke* types hij gebruikt en *hoe* hij ze toont.

| Type | Je voorspelt | Uitslag | Standaardregels | Gebruikt door |
| --- | --- | --- | --- | --- |
| `score` | Een uitslag tussen twee partijen (thuis–uit) | Twee getallen, evt. winnaar na strafschoppen | Exact 5 · juiste toto (winst/gelijk/verlies) 2 · juist doelsaldo +1 | Voetbal, hockey, handbal, tennis (sets) |
| `pick` | Eén keuze uit een lijst | Eén optie | 3 punten (bonusvragen vaak 5–10) | Winnaar knock-outwedstrijd, kampioen, topscorer, "wie wint de 500m?" |
| `ranking` | Een volgorde van de top N | Volgorde | Juiste plek 3 · wel in top N maar verkeerde plek 1 | Podium schaatsen, medaillespiegel, eindstand groep, Formule 1 |
| `numeric` | Een getal | Een getal | Exact 5 · dichtstbij 3 · binnen marge 1 | Totaal aantal goals, aantal NL-medailles, wereldrecordtijd |

Dit zijn de enige vier plekken waar scoring-logica leeft. Alles daarboven is
compositie:

- **Voetbaltoernooi** = `score` per wedstrijd (groepsfase + knock-out) +
  `pick` kampioen + `pick` topscorer + optioneel `ranking` eindstand per groep.
- **WK Afstanden schaatsen** = `ranking` (top 3) per afstand + `numeric`
  aantal Nederlandse medailles.
- **Olympische Spelen** = `ranking` medaillespiegel top 10 + `pick` winnaar
  per geselecteerd onderdeel + `numeric` totaal NL-medailles. Dit is een
  multisport-evenement: de fases zijn sporten/dagen.
- **Eigen bedrijfs-dartstoernooi** = `pick` per wedstrijd uit een
  knock-out-template.

Sinds 9 november 2026 is er een vijfde type, **`bracket`**: het hele
knock-outschema vooraf invullen. De groepsvolgorde bepaalt wie in de eerste
ronde staat (standaard volgend uit je voorspelde groepsuitslagen), daarna kies
je per wedstrijd de winnaar tot er een kampioen staat. Eén onderdeel per
toernooi, sluit bij de eerste aftrap, mag tussentijds half bewaard worden.
Punten: per juiste groepsplek, per team dat jij in ronde *r* zet en daar echt
speelt (oplopend per ronde), en voor de kampioen. Daarnaast blijven de echte
knock-outwedstrijden los voorspelbaar als `score` zodra de teams bekend zijn.
De logica staat in `modules/fixture-types/bracket.ts` en `bracket-tree.ts`.

### Wielrennen (module `cycling`, 9 november 2026)

Wielrennen gebruikt alleen `ranking`, `pick` en `numeric`; er is geen nieuw
voorspellingstype nodig. Wel drie kleine uitbreidingen die ook voor andere
sporten bruikbaar zijn:

- **Reeksen** (`SportModule.series`, `events.meta.series`): een evenement
  kan in reeksen zitten, bijv. *Monumenten*, *Voorjaarsklassiekers*,
  *Kasseiklassiekers*, *Ardennenklassiekers* of *Grote rondes*. Bij het
  aanmaken van een poule kies je zo'n reeks in één tik; daarna zijn het
  gewoon losse evenementen in de poule. Een reeks verschijnt pas als hij
  minstens twee evenementen in de catalogus heeft.
- **Parcours per onderdeel** (`fixtures.details`): route, afstand en
  profiel (vlak, heuvelachtig, bergen, aankomst bergop, tijdrit,
  ploegentijdrit, kasseien). De lijst toont het profiel als icoon.
- **"Andere renner"** (`OTHER_OPTION_ID = "other"`): voor als de winnaar niet
  in de lijst staat. In een keuzevraag is het een gewone optie. In een
  volgorde mag alleen de uitslag hem gebruiken, ook op meerdere plekken, en
  levert hij nooit punten op; in het voorspelscherm is hij verborgen.

**Atleten** (tabel `athletes`, 9 november 2026): renners (en later schaatsers)
staan één keer per sport in de database, met een zoekindex op naam en land
(zonder accenten). Een keuze- of volgordevraag kan een `pool: { sport }`
hebben: de `options` zijn dan alleen de favorieten, en je mag elke atleet
van die sport kiezen. De server controleert bij opslaan dat een keuze
buiten de favorieten echt een atleet van die sport is, en levert de namen
van gebruikte atleten mee in de deelnemerslijsten van `events.get` en
`events.fixture`. In de app is er één weergave voor alle pool-vragen (je
podium, daaronder één lijst), zowel bij voorspellen als bij het invoeren van
een uitslag. Het podium toont de treden 2–1–3 (of 4–2–1–3–5 bij een top 5);
de blauwe trede is de plek die je nu kiest. Tik een renner in de lijst en
hij komt daar; tik een gevulde trede om hem te vervangen (eigen scherm
"Vervang X" met de native zoekbalk onderaan en een prullenbak om de plek
leeg te maken); houd een renner
vast en sleep hem naar een andere trede om te wisselen. De lijst heeft
bovenaan een zoekveld (`athletes.search`, met landfilter) en toont zonder
zoekterm de favorieten; gekozen renners staan er niet nog eens in. Is alles
gevuld, dan verdwijnt de lijst.

De puntentelling gebruikt dezelfde sleutels als voetbal (`classic`,
`allOrNothing`), zodat één poule voetbal en wielrennen kan combineren.
Seed: `npx convex run seedCycling:calendar2027` (klassiekers, monumenten en
de Tour 2027; data en starttijden zijn schattingen) en
`npx convex run seedCycling:testTour` (vijf testetappes, één per dag).

### Invullen per soort evenement

| Soort | Weergave | Invoer |
| --- | --- | --- |
| Toernooi (groepen + knock-out) | Tabs *Groepen · Schema · Extra* | Groepen: alle wedstrijden onder elkaar met een cijferblok dat na elk cijfer doorspringt en automatisch opslaat; je voorspelde stand rekent live mee. Schema: bracket met rondes als kolommen, tik de winnaar, de bracket schuift zelf door. |
| Competitie (Eredivisie) | Tabs *Speelrondes · Extra* | Eén speelronde per scherm, per dag gegroepeerd, pijlen naar vorige/volgende ronde, zelfde cijferblok. |
| Losse wedstrijd | Modal | Grote wedstrijdkaart met − en +, snelkeuzes (1–0, 2–1, …) en "Nederland wint". |
| Bonusvragen | Lijst | Keuze als lijst met vinkje; top N door teams in volgorde aan te tikken. |
| Wielerronde (Tour, Giro, Vuelta) | Tabs *Klassementen · Etappes* | Klassementen: deadlinekaart met voortgang, truikaarten in de kleur van de trui (geel = top 5 eindklassement, groen, bollen, wit) en extra vragen als kaarten. Etappes: strip met alle ritten (nummer, dag, stip/vinkje) en per etappe een swipebare pagina met parcourskaart (route, hoogteprofiel, afstand, soort rit met uitleg voor wie hij gunstig is, aftellen) en een podium 2–1–3 met jouw keuze; na de uitslag zie je per renner of hij goed zat. |
| Eendagskoers (klassieker) | Eén pagina *Koers* | Parcourskaart met reekslabel ("Monument"), jouw podium en de extra vragen als kaarten. |

Rennerkeuze: vanaf 12 opties een zoekveld (naam of landcode, zonder accenten). Hoogteprofielen zijn gestileerd per soort rit (`STAGE_PROFILES` in `modules/cycling/stage-profile.ts`) en worden met gewone views getekend, zodat er geen native module bij hoeft.

Bracket, cijferblok en wedstrijdkaart zijn eigen React Native-views (geen
`@expo/ui`-equivalent), met systeemkleuren via `useAppColors` (UIKit op iOS,
Material 3 op Android). De tabwissel is wél native (`@expo/ui` segmented
control).

---

## 4. Domeinmodel en Convex-schema (concept)

Module-specifieke data (`payload`, `result`, prediction-`payload`, `rules`)
is JSON dat door de module wordt gevalideerd met Convex-validators. In het
schema staat het voorlopig als `v.any()`; zodra de modules er zijn, wordt dat
een `v.union` van de module-validators zodat `tsc` fouten vangt.

```ts
// convex/schema.ts (concept)
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  poules: defineTable({
    name: v.string(),
    emoji: v.optional(v.string()),
    ownerId: v.id("users"),
    inviteCode: v.string(),              // kort, deelbaar: "RIV-7K3Q"
    status: v.union(v.literal("open"), v.literal("archived")),
    settings: v.object({
      // Zien leden elkaars voorspellingen vóór de sluitingstijd?
      revealPredictions: v.union(v.literal("afterLock"), v.literal("always")),
    }),
  })
    .index("by_inviteCode", ["inviteCode"])
    .index("by_owner", ["ownerId"]),

  pouleMembers: defineTable({
    pouleId: v.id("poules"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_poule", ["pouleId"])
    .index("by_user", ["userId"])
    .index("by_poule_and_user", ["pouleId", "userId"]),

  // Welke evenementen zitten in een poule, en met welke regels.
  pouleEvents: defineTable({
    pouleId: v.id("poules"),
    eventId: v.id("events"),
    presetKey: v.string(),               // "classic" | "allOrNothing" | "custom"
    rules: v.optional(v.any()),          // per onderdeeltype, overschrijft preset
  })
    .index("by_poule", ["pouleId"])
    .index("by_event", ["eventId"]),

  events: defineTable({
    moduleKey: v.string(),               // "football" | "speedskating" | "multisport"
    name: v.string(),
    slug: v.string(),
    startsAt: v.number(),
    endsAt: v.number(),
    status: v.union(
      v.literal("draft"), v.literal("upcoming"),
      v.literal("live"), v.literal("finished"),
    ),
    visibility: v.union(v.literal("public"), v.literal("private")),
    ownerPouleId: v.optional(v.id("poules")), // alleen bij eigen toernooien
    createdBy: v.id("users"),
    meta: v.any(),                       // module-specifiek (logo, kleuren, bron)
  })
    .index("by_slug", ["slug"])
    .index("by_visibility_and_status", ["visibility", "status"]),

  stages: defineTable({
    eventId: v.id("events"),
    key: v.string(),                     // "group-a", "r16", "day-3", "1500m-men"
    name: v.string(),
    order: v.number(),
    kind: v.string(),                    // module bepaalt de weergave: "group" | "knockout" | "race" | ...
    meta: v.any(),
  }).index("by_event", ["eventId"]),

  participants: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    shortName: v.optional(v.string()),
    code: v.optional(v.string()),        // "NED"
    imageUrl: v.optional(v.string()),
    groupKey: v.optional(v.string()),
    meta: v.any(),
  }).index("by_event", ["eventId"]),

  fixtures: defineTable({
    eventId: v.id("events"),
    stageId: v.id("stages"),
    type: v.union(
      v.literal("score"), v.literal("pick"),
      v.literal("ranking"), v.literal("numeric"),
    ),
    order: v.number(),
    label: v.optional(v.string()),       // "Wie wordt topscorer?"
    startsAt: v.number(),
    locksAt: v.number(),                 // standaard = startsAt
    status: v.union(
      v.literal("scheduled"), v.literal("live"),
      v.literal("finished"), v.literal("cancelled"),
    ),
    payload: v.any(),                    // score: { homeId, awayId } · pick: { options } · ...
    result: v.optional(v.any()),
  })
    .index("by_event", ["eventId"])
    .index("by_stage", ["stageId"])
    .index("by_status_and_locksAt", ["status", "locksAt"]),

  predictions: defineTable({
    userId: v.id("users"),
    fixtureId: v.id("fixtures"),
    eventId: v.id("events"),
    payload: v.any(),
    updatedAt: v.number(),
  })
    .index("by_user_and_fixture", ["userId", "fixtureId"])
    .index("by_fixture", ["fixtureId"])
    .index("by_user_and_event", ["userId", "eventId"]),

  scores: defineTable({
    pouleId: v.id("poules"),
    userId: v.id("users"),
    fixtureId: v.id("fixtures"),
    points: v.number(),
    breakdown: v.record(v.string(), v.number()), // { exact: 5 } of { toto: 2, diff: 1 }
  })
    .index("by_poule_and_user", ["pouleId", "userId"])
    .index("by_poule_and_fixture", ["pouleId", "fixtureId"]),

  standings: defineTable({
    pouleId: v.id("poules"),
    userId: v.id("users"),
    points: v.number(),
    rank: v.number(),
    stats: v.object({
      predicted: v.number(),
      exact: v.number(),
    }),
  })
    .index("by_poule_and_points", ["pouleId", "points"])
    .index("by_poule_and_user", ["pouleId", "userId"]),
});
```

Ontwerpkeuzes die hierin zitten:

- **Voorspelling per gebruiker, niet per poule.** Simpel voor de gebruiker en
  minder data. Als later blijkt dat mensen per poule anders willen gokken, kan
  een optioneel `pouleId` op `predictions` dat alsnog mogelijk maken.
- **Scores en standen zijn gedenormaliseerd.** Ze worden herberekend wanneer
  een uitslag binnenkomt, nooit live in een query opgeteld. Een poule met 40
  leden en 100 onderdelen is dan nog steeds één indexlookup.
- **Fases zijn een eigen tabel**, zodat de UI per fase een andere weergave kan
  kiezen zonder alle onderdelen te hoeven lezen.
- **Eigen toernooien** zijn gewoon evenementen met `visibility: "private"` en
  een `ownerPouleId`. Geen apart pad.

---

## 5. Module-architectuur

### Mapstructuur

```
modules/
  types.ts                 # SportModule, FixtureType, ScoringPreset interfaces
  registry.ts              # alle modules op key, pure TS (server + client)
  registry.ui.tsx          # UI-componenten per module (alleen client)
  fixture-types/
    score.ts               # validators + score() voor type "score"
    pick.ts
    ranking.ts
    numeric.ts
  football/
    module.ts              # key, presets, templates, welke types, stage-kinds
    ui/
      EventOverview.tsx    # tabs per fase: groepstabellen, knock-out-schema
      Bracket.tsx          # het klassieke toernooischema
      GroupTable.tsx
      MatchCard.tsx
  speedskating/
    module.ts
    ui/
      EventOverview.tsx    # per afstand een podiumkaart
      PodiumCard.tsx
  multisport/
    module.ts              # combineert fases van verschillende sporten
    ui/
      MedalTable.tsx
```

Alles behalve `ui/` is pure TypeScript zonder React of Node en wordt door
zowel `convex/` als `src/` geïmporteerd. Daardoor valideert en scoort de
server met exact dezelfde code als waarmee de client het formulier toont.

### Interfaces (concept)

```ts
// modules/types.ts
import type { Validator } from "convex/values";

export interface FixtureType<Payload, Result, Prediction, Rules> {
  key: "score" | "pick" | "ranking" | "numeric";
  payload: Validator<Payload>;
  result: Validator<Result>;
  prediction: Validator<Prediction>;
  rules: Validator<Rules>;
  defaultRules: Rules;
  score(args: { prediction: Prediction; result: Result; rules: Rules }):
    { points: number; breakdown: Record<string, number> };
}

export interface ScoringPreset {
  key: string;                      // "classic"
  name: string;                     // "Klassiek"
  description: string;              // "Exacte uitslag 5, juiste toto 2, ..."
  rules: Record<string, unknown>;   // per fixture-type key
}

export interface EventTemplate {
  key: string;                      // "knockout-8"
  name: string;                     // "Knock-out, 8 deelnemers"
  build(input: { participants: string[]; startsAt: number }): {
    stages: StageDraft[];
    fixtures: FixtureDraft[];
  };
}

export interface SportModule {
  key: string;
  name: string;
  icon: string;
  fixtureTypes: FixtureType<any, any, any, any>["key"][];
  stageKinds: string[];             // welke weergaven de UI moet kennen
  presets: ScoringPreset[];
  templates: EventTemplate[];       // voor eigen toernooien; mag leeg
}
```

De UI-registry koppelt per module de componenten `EventOverview`,
`FixtureCard` en `PredictionForm`. Generieke schermen (poule, stand, lijst met
openstaande voorspellingen) roepen die via de registry aan en weten zelf niets
van voetbal of schaatsen. Een `PredictionForm` voor type `score` is generiek;
een module mag hem overschrijven voor een eigen look (bijvoorbeeld met
teamlogo's).

### Een nieuwe sport toevoegen

1. `modules/<sport>/module.ts`: kies types, schrijf presets, eventueel
   templates.
2. `modules/<sport>/ui/EventOverview.tsx`: de weergave per fase-soort.
3. Registreer in `registry.ts` en `registry.ui.tsx`.
4. Voer een evenement in via de admin-schermen (of een importer).

Geen schema-wijziging, geen nieuwe scoring, geen nieuwe schermen.

---

## 6. Gebruikersflows

### 6.1 Poule aanmaken (de belangrijkste flow)

```
[ + Nieuwe poule ]
   │
   ▼
Stap 1  Naam + emoji                         ("Kantoorpoule 🏒")
   │
   ▼
Stap 2  Kies wedstrijden                     Catalogus, gegroepeerd:
         ▸ Binnenkort                         • EK voetbal 2028
         ▸ Voetbal · Schaatsen · Wielrennen   • WK Afstanden
         ▸ Eigen toernooi maken               • Olympische Spelen 2028
         (meerdere selecteerbaar)
   │
   ▼
Stap 3  Puntentelling                        Per evenement een preset:
         ● Klassiek (aanbevolen)              "Exact 5 · toto 2 · saldo +1"
         ○ Alles of niets
         ○ Aangepast → regels per type
   │
   ▼
Klaar   Deel-scherm                          Link + code + "Deel via..."
         → direct door naar de eerste voorspellingen
```

Stap 3 mag worden overgeslagen; dan geldt de aanbevolen preset. Evenementen
kunnen later altijd worden toegevoegd of verwijderd door owner/admins.

### 6.2 Meedoen

Link `rivaly.app/j/RIV-7K3Q` → opent de app (Universal Link / App Link) →
inloggen/registreren → preview van de poule (naam, leden, evenementen) →
**Meedoen** → landt direct op "Te voorspellen". Bestaande voorspellingen van
de gebruiker op die evenementen tellen meteen mee.

Zonder geïnstalleerde app toont `rivaly.app/j/<code>` een statische pagina met
de poulenaam en knoppen naar de App Store en Play Store. Na installatie kan de
gebruiker de code ook handmatig invoeren onder "Meedoen met code". Dit is de
enige webpagina van het platform en hoort niet bij de Expo-app.

### 6.3 Voorspellen

- Startscherm toont een **"Te voorspellen"**-lijst over alle poules heen,
  gesorteerd op sluitingstijd. Dit is het dagelijkse instappunt.
- Per onderdeel een compact formulier van het bijbehorende type; swipe of
  "volgende" voor de volgende. Opslaan gebeurt per onderdeel, direct.
- Na `locksAt` is het formulier alleen-lezen en worden voorspellingen van
  anderen zichtbaar (afhankelijk van `revealPredictions`).
- Pushnotificatie: "Nog 1 uur om te voorspellen voor NL–BEL".

### 6.4 Uitslagen en stand

- Admin voert uitslag in (of een importer doet dat) → server herberekent
  scores voor alle poules die dit evenement bevatten → standen updaten →
  iedereen ziet het realtime.
- Stand toont rang, punten, verschil met de nummer 1 en de beweging sinds de
  vorige speeldag. Tik op een lid → diens voorspellingen en punten per
  onderdeel.

---

## 7. Schermen (Expo Router)

```
src/app/
  (auth)/
    sign-in.tsx
  (app)/
    _layout.tsx                 # tabs: Home · Poules · Profiel
    index.tsx                   # Home: te voorspellen + mijn poules (rang, volgende deadline)
    poules/
      index.tsx                 # mijn poules
      new.tsx                   # wizard (stap 1–3, modal)
      [pouleId]/
        _layout.tsx             # tabs binnen poule: Stand · Programma · Leden · Instellingen
        index.tsx               # Stand
        schedule.tsx            # Programma: evenementen → fases → onderdelen, met module-weergave
        members.tsx
        settings.tsx
        events/[eventId].tsx    # EventOverview van de module (bracket, tabellen, podiums)
    predict/[fixtureId].tsx     # voorspelformulier (modal, swipe door de reeks)
    settings/                   # instellingen: app-versie, later taal; account via de avatar
  j/[code].tsx                  # deep link vanuit de uitnodiging → preview + Meedoen
  admin/                        # alleen platformbeheerders: evenementen, uitslagen invoeren
```

Schermen volgen de drie lagen van `@expo/ui`: de **universele** componenten
(`@expo/ui`) waar één implementatie volstaat, en `.ios.tsx` / `.android.tsx`
varianten met `@expo/ui/swift-ui` en `@expo/ui/jetpack-compose` waar de
platformen echt verschillen. De data-laag van een scherm (Convex-queries,
mutations) zit in één gedeeld bestand, zodat de platformvarianten alleen
weergave bevatten.

De bouwstenen staan in `src/components/ui/` en hebben elk een `.ios.tsx`
(SwiftUI) en `.android.tsx` (Jetpack Compose) variant:

| Bouwsteen | iOS | Android |
| --- | --- | --- |
| `Screen` + `Section` | `Form` met inset-grouped secties | Material-lijst met kaarten |
| `NavRow` | Settings-rij: SF Symbol, titel, ondertitel, waarde, chevron of vinkje | `ListItem` met leading/trailing slots, geen chevron |
| `ActionButton` | `borderedProminent` / `bordered`, volle breedte | Filled / Filled tonal / Outlined (error) |
| `DestructiveRow` | rode gecentreerde tekstrij | lijstrij in error-kleur |
| `NumberStepper` | native `Stepper` | label met twee tonal knoppen |
| `EmptyState` | `ContentUnavailableView` | gecentreerde titel en toelichting |
| `AppText` | iOS-tekststijlen (`largeTitle` … `footnote`) | Material-typografie (`displaySmall` … `bodySmall`) |
| `BrandHero` | symbool, afgeronde titel | `displayMedium` in primary-kleur |

Vuistregels die hieruit volgen: tabschermen hebben geen vaste knoppen onderaan
(de iOS 26-tabbalk zweeft over de inhoud), acties zitten als rijen in de lijst
of als knop in de navigatiebalk (`Stack.Toolbar`), en modals (poule aanmaken,
voorspellen, uitslag) hebben wél een vaste actiebalk onderaan. Meerkeuze in
een formulier is een rij met vinkje, geen schakelaar: de SwiftUI `Toggle` gaf
in Expo Go geen events door.

---

## 8. Scoring-engine (server)

```
setResult(fixtureId, result)          ← admin-mutation of importer
   │  valideert met module.result-validator, zet status "live" of "finished"
   ▼
ctx.scheduler.runAfter(0, internal.scoring.recomputeFixture, { fixtureId })
   │
   ▼
recomputeFixture
   │  pouleEvents.by_event → lijst poules
   │  per poule: scheduler.runAfter(0, internal.scoring.recomputePouleFixture, { pouleId, fixtureId })
   ▼
recomputePouleFixture
   │  regels = preset van pouleEvent (+ overrides)
   │  leden → predictions.by_user_and_fixture → fixtureType.score(...)
   │  upsert scores.by_poule_and_fixture
   │  herbereken standings voor deze poule (som scores per gebruiker, rang toekennen)
   ▼
Clients krijgen de nieuwe stand via hun bestaande query-subscriptions.
```

- Idempotent: herberekenen van hetzelfde onderdeel geeft hetzelfde resultaat,
  dus een correctie van een uitslag is gewoon opnieuw `setResult`.
- Per poule een eigen scheduled mutation houdt transacties klein en voorkomt
  conflicten bij grote evenementen.
- Later: `@convex-dev/workpool` als er honderden poules per onderdeel zijn.

---

## 9. Data-invoer

| Fase | Bron | Hoe |
| --- | --- | --- |
| MVP | Handmatig | Admin-schermen in de app (alleen voor platformbeheerders): evenement, fases, deelnemers, onderdelen, uitslagen. Plus een seed-script voor een testtoernooi. |
| Daarna | Voetbal-API | Importer-action per module (bijv. football-data.org of API-Football) die fixtures en uitslagen synchroniseert via een cron. |
| Daarna | Schaatsen / multisport | Weinig bruikbare API's; handmatig of semi-automatisch (CSV-import). |
| Daarna | Wielrennen | Startlijsten en uitslagen (bijv. ProCyclingStats) importeren, zodat elke renner kiesbaar is en "Andere renner" zelden nodig is. |
| Later | Gebruikers | Eigen toernooien via templates; owner voert zelf uitslagen in. |

De importer-laag is bewust optioneel in het module-contract: een module werkt
volledig met handmatige invoer.

---

## 10. Technische keuzes

| Onderwerp | Keuze / voorstel |
| --- | --- |
| App | Expo SDK 58, Expo Router, React 19. **Alleen iOS en Android**, geen web-target. |
| UI | **Native gevoel op beide platforms is de eis; `@expo/ui` is het standaardmiddel** (SwiftUI op iOS, Jetpack Compose op Android, versie ~58.0.27, draait ook in Expo Go). Universele laag waar mogelijk, platformvarianten waar nodig. Afwijken mag als `@expo/ui` iets niet biedt, met voorkeur voor oplossingen die native blijven ogen (bijvoorbeeld een tekenlaag zoals `react-native-skia` voor het toernooischema, of een React Native-view binnen een `Host`). Zo'n afwijking noemen we expliciet in de PR. |
| Backend | Convex: schema, queries/mutations, scheduler, crons, realtime. |
| Auth | **Clerk** (besloten 8 nov 2026). Volwassen Expo-SDK, Apple/Google/e-mail login. Convex leest de identiteit via `ctx.auth.getUserIdentity()` met `convex/auth.config.ts` op het Clerk-domein. |
| Gedeelde code | `modules/` top-level, pure TS, geïmporteerd door `convex/` en `src/`. |
| Notificaties | `expo-notifications` + Convex cron die elk kwartier onderdelen zoekt die binnen een uur sluiten en nog niet voorspeld zijn. |
| Links | Universal Links (iOS) en App Links (Android) op `rivaly.app/j/<code>`. Zonder app: statische store-pagina (zie §6.2). |
| Testen | `convex-test` voor scoring en autorisatie (verkeerde gebruiker mag niet in andermans poule, voorspellen na lock wordt geweigerd). |
| Autorisatie | Identiteit altijd server-side uit `ctx.auth`; elke poule-mutation checkt lidmaatschap/rol via `pouleMembers.by_poule_and_user`. |

---

## 11. Roadmap

**Fase 0 — Fundament** (de basis waar alles op leunt) — *gebouwd op 8 november 2026, zie [setup.md](setup.md); nog te doen: Clerk-applicatie aanmaken en op een toestel testen*
- Projectopzet: web-target en `react-native-web` verwijderen uit `app.json`
  en `package.json`, Clerk installeren, `@expo/ui`-basis (Host, navigatie,
  tabbalk) als voorbeeldscherm per platform.
- Auth + `users`, schema zoals hierboven, module-registry met de vier
  fixture-types (validators + scoring, met tests).
- Poule aanmaken, uitnodigingscode, meedoen, ledenlijst, rollen.
- Admin-schermen voor evenementen en uitslagen; seed-script met een
  testtoernooi.

**Fase 1 — Voetbal, één toernooi, end-to-end**
- Module `football`: groepsfase + knock-out, groepstabellen, bracket.
- "Te voorspellen"-lijst, voorspelformulier `score` en `pick`, lock-gedrag.
- Scoring-engine, stand, detail per lid.
- Hiermee kan de eerste echte poule draaien.

**Fase 2 — Meer evenementen in één poule + schaatsen**
- Wizard ondersteunt meerdere evenementen, stand per evenement en totaal.
- Module `speedskating` met `ranking` en `numeric`.
- Bonusvragen als fase, pushnotificaties voor deadlines en uitslagen.

**Fase 3 — Multisport en eigen toernooien**
- Module `multisport` (Olympische Spelen 2028 als stip op de horizon):
  medaillespiegel, fases per sport.
- Templates voor eigen toernooien, owner voert uitslagen in.
- Eerste importer (voetbal-API) met cron.

**Fase 4 — Sociaal en verdienmodel**
- Reacties/chat per poule, hoogtepunten ("Mees had als enige 3–3").
- Statistieken, seizoensarchief, eventueel premium-poules of sponsoring.

---

## 12. Beslissingen

**Genomen (8 november 2026)**

1. **Auth-provider: Clerk.** Snelste weg naar Apple/Google/e-mail login op Expo.
2. **Eerste echte evenement: een voetbaltoernooi** (groepsfase + knock-out).
   Fase 1 richt zich volledig op de module `football`.
3. **Eén voorspelling per gebruiker**, die in al je poules meetelt. Geen
   voorspellingen per poule.
4. **Eigen toernooien pas in fase 3.** De wizard in fase 1 kiest alleen uit de
   catalogus.

5. **Voorspellingen van anderen pas zichtbaar na sluiting** (`afterLock`),
   per poule instelbaar naar "altijd".
6. **Alleen iOS en Android, geen webversie.** De uitnodigingslink valt terug
   op een statische store-pagina.
7. **UI moet op beide platforms native aanvoelen; `@expo/ui` zo veel
   mogelijk**, afwijken mag waar het niet anders kan.
8. **Alleen Nederlands**, geen vertaallaag. Teksten mogen direct in de
   componenten staan.

**Nog open**

- Geen. Nieuwe vragen komen hier terecht zodra ze opduiken tijdens het bouwen.

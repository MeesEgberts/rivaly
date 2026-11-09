# Rivaly — Ontwikkelomgeving opzetten

Eenmalige stappen om de app lokaal te draaien. Het ontwerp staat in
[ontwerp.md](ontwerp.md).

## 1. Afhankelijkheden

```bash
npm install
```

## 2. Convex

```bash
npx convex dev
```

Dit koppelt de dev-deployment en vult `CONVEX_DEPLOYMENT` en
`EXPO_PUBLIC_CONVEX_URL` in `.env.local`. Laat dit draaien tijdens het
ontwikkelen: het pusht functies en schema bij elke wijziging.

## 3. Clerk

1. Maak een applicatie aan op [dashboard.clerk.com](https://dashboard.clerk.com).
   Zet e-mail aan en naar wens Google en Apple.
2. **Integrations → Convex → Activate.** Clerk maakt dan het JWT-template
   `convex` aan dat de app gebruikt.
3. Kopieer de **Frontend API URL** (bijv. `https://verb-noun-00.clerk.accounts.dev`)
   en zet hem als `CLERK_JWT_ISSUER_DOMAIN` op de Convex-deployment:

   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://verb-noun-00.clerk.accounts.dev
   ```

   Tijdens fase 0 staat hier een placeholder; vervang die.
4. Kopieer de **Publishable key** naar `.env.local`:

   ```
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

Inloggen gaat via Clerk's hosted Account Portal (`useHostedAuth`). Dat werkt
in Expo Go; native Google/Apple-knoppen vragen later een development build.

## 4. App starten

```bash
npx expo start
```

Open in Expo Go of een simulator (`i` voor iOS, `a` voor Android). Web is
bewust uitgeschakeld.

## 5. Testdata

Log eerst één keer in met de app, zodat er een gebruiker bestaat. Daarna:

```bash
npx convex run seed:makeAdmin '{"email":"jouw@adres.nl"}'
```

```bash
npx convex run seed:testCup
```

```bash
npx convex run seed:eredivisie
```

De eerste maakt je platformbeheerder (tabblad Profiel krijgt een Beheer-knop
om uitslagen in te voeren). De tweede zet een testtoernooi met 16 landen in
vier groepen plus een knock-outschema in de catalogus, de derde een
Eredivisie-seizoen met drie speelrondes. De eerste wedstrijden beginnen over
twee uur. Om een evenement aan al je bestaande poules te hangen:

```bash
npx convex run seed:linkToAllPoules '{"eventId":"<id uit de vorige stap>"}'
```

## 6. Controles

```bash
npx tsc --noEmit
```

```bash
npx expo lint
```

```bash
npx vitest run
```

## Mapstructuur

| Map | Inhoud |
| --- | --- |
| `convex/` | Backend: schema, functies, scoring, seed |
| `modules/` | Gedeelde module-code: fixture-types, registry, sportmodules |
| `src/app/` | Expo Router schermen: alleen compositie, geen logica |
| `src/components/` | Componenten, per feature gegroepeerd; alleen `.tsx` |
| `src/hooks/` | Alles met React-state (`use-*.ts`), ook de Convex-datahooks |
| `src/utils/` | Pure helpers: formattering, bracket-rekenwerk, concepten |
| `src/types/`, `src/constants/`, `src/theme/` | Gedeelde typen, constanten en kleuren |
| `docs/` | Ontwerp en deze handleiding |

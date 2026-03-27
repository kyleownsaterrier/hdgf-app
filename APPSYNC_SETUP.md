# Amplify Gen 1 — Backend Setup Guide

## 1. Update the GraphQL schema

Copy the contents of `appsync/schema.graphql` into your Amplify API schema file:

```
amplify/backend/api/YOUR_API_NAME/schema.graphql
```

The schema uses `@model` (Amplify auto-generates DynamoDB table + CRUD resolvers)
and `AWSJSON` to store row arrays as JSON strings.

## 2. Push to AWS

```bash
amplify push
```

When prompted:
- **Do you want to generate code for your newly created GraphQL API?** → Yes
- **Choose the code generation language target** → typescript
- **Enter the file name pattern of graphql queries, mutations and subscriptions** → src/graphql/**/*.ts
- **Do you want to generate/update all possible GraphQL operations?** → Yes
- **Enter maximum statement depth** → 2

This generates `src/amplifyconfiguration.json` and `src/graphql/` automatically.

## 3. Install the Amplify library

```bash
npm install aws-amplify
```

## 4. Run the app

```bash
ng serve
```

Amplify is configured in `src/main.ts` using `amplifyconfiguration.json`.
No manual endpoint or API key configuration needed.

---

## How the mutations work

The app uses two `@model` types — `DoublesTable` and `BagTagsTable`.
Each has a single record with a fixed ID (`doubles-main` / `bagtags-main`).

Rows are serialised as `AWSJSON` (a JSON string), so no complex nested
input types are needed. The service calls the Amplify-generated
`createDoublesTable` on first save and `updateDoublesTable` on subsequent saves.

The `DataService` (`src/app/services/data.service.ts`) debounces all saves
by 800 ms — rapid typing won't spam the API.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find module './amplifyconfiguration.json'` | Run `amplify push` first |
| `No current user` error | Make sure auth rules allow `public` with `apiKey` (already in schema) |
| Save indicator stays on "Saving…" | Check browser console for GraphQL errors; confirm `amplify push` completed |
| Data not loading on refresh | Confirm the fixed record IDs match (`doubles-main`, `bagtags-main`) |

# AWS AppSync Setup Guide

Follow these steps to deploy the GraphQL backend for the HDGF App.

---

## 1. Prerequisites

- An AWS account
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+

---

## 2. Create the AppSync API

### Option A — AWS Console (easiest)

1. Go to **AWS Console → AppSync → Create API**
2. Choose **Build from scratch**, click **Start**
3. Name it `hdgf-api`, click **Create**
4. On the left sidebar, click **Schema**
5. Paste the contents of `appsync/schema.graphql` into the editor
6. Click **Save Schema**

### Option B — AWS CLI

```bash
aws appsync create-graphql-api \
  --name hdgf-api \
  --authentication-type API_KEY
```

---

## 3. Create the DynamoDB Tables

Create two DynamoDB tables:

```bash
# Doubles table
aws dynamodb create-table \
  --table-name hdgf-doubles \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Bag Tags table
aws dynamodb create-table \
  --table-name hdgf-bagtags \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

---

## 4. Attach DynamoDB as a Data Source in AppSync

1. In AppSync console, go to **Data Sources → Create data source**
2. Choose **Amazon DynamoDB table**
3. Select region, then select `hdgf-doubles` table
4. Let AppSync create a new IAM role (it will add DynamoDB permissions automatically)
5. Click **Create**
6. Repeat for `hdgf-bagtags`

---

## 5. Create Resolvers

For each operation in the schema, attach a resolver:

### saveDoublesTable (Mutation)
- Data source: `hdgf-doubles`
- Request mapping template:
```json
{
  "version": "2018-05-29",
  "operation": "PutItem",
  "key": { "id": { "S": "$ctx.args.id" } },
  "attributeValues": {
    "rows":      { "S": "$util.toJson($ctx.args.rows)" },
    "caliPlayer":{ "S": "$util.defaultIfNullOrEmpty($ctx.args.caliPlayer, '')" },
    "updatedAt": { "S": "$util.time.nowISO8601()" }
  }
}
```
- Response mapping template:
```json
$util.toJson($ctx.result)
```

### getDoublesTable (Query)
- Data source: `hdgf-doubles`
- Request mapping template:
```json
{
  "version": "2018-05-29",
  "operation": "GetItem",
  "key": { "id": { "S": "$ctx.args.id" } }
}
```
- Response mapping template:
```json
#if($ctx.result)
  #set($result = $ctx.result)
  #set($result.rows = $util.parseJson($ctx.result.rows))
  $util.toJson($result)
#else
  null
#end
```

### saveBagTagsTable (Mutation) — same pattern as saveDoublesTable, using `hdgf-bagtags`

### getBagTagsTable (Query) — same pattern as getDoublesTable, using `hdgf-bagtags`

---

## 6. Create an API Key

1. In AppSync console, go to **Settings**
2. Under **API Keys**, click **Create API Key**
3. Set expiry (max 1 year), click **Create**
4. Copy the API key value

---

## 7. Configure the Angular App

Edit `src/environments/environment.ts` and fill in your values:

```typescript
export const environment = {
  production: false,
  appSync: {
    endpoint: 'https://YOUR_API_ID.appsync-api.us-east-1.amazonaws.com/graphql',
    apiKey: 'da2-xxxxxxxxxxxxxxxxxxxx',
    doublesTableId: 'doubles-main',
    bagTagsTableId: 'bagtags-main',
  }
};
```

> Find your endpoint in **AppSync → your API → Settings → API URL**

Also update `src/environments/environment.prod.ts` with the same values for production builds.

---

## 8. Run the App

```bash
npm install
ng serve
```

The app will now auto-save both tables to DynamoDB via AppSync whenever data changes (debounced 800ms). Data is restored on next load.

---

## Security Notes

- The API key is suitable for a private/internal app. For a public app, switch to **Amazon Cognito** authentication in AppSync settings.
- Consider setting a short API key expiry and rotating it periodically.
- Restrict CORS in production by configuring allowed origins on your AppSync API.

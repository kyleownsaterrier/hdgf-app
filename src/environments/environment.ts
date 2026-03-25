export const environment = {
  production: false,
  appSync: {
    // Replace these values after deploying your AppSync API
    // Find them in AWS Console → AppSync → your API → Settings
    endpoint: 'https://YOUR_API_ID.appsync-api.YOUR_REGION.amazonaws.com/graphql',
    apiKey: 'YOUR_API_KEY',
    // The fixed record IDs used to store each table's data
    doublesTableId: 'doubles-main',
    bagTagsTableId: 'bagtags-main',
  }
};

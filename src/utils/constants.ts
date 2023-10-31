// Temporary host domain
const REMOTE_DOMAIN =
  'https://65412552c1fce622dd7d1e79--majestic-pothos-b9b3cd.netlify.app/';

// Using an environment variable to store the base URL
export const ASSET_BASE_URL = import.meta.env.BASE_URL || REMOTE_DOMAIN;

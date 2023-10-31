// Temporary host domain
const REMOTE_DOMAIN = 'https://main--majestic-pothos-b9b3cd.netlify.app/';

// Using an environment variable to store the base URL
export const ASSET_BASE_URL = process.env.BASE_URL || REMOTE_DOMAIN;

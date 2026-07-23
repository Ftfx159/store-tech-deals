const AFFILIATE_TAG = "ftfxtechsolut-21";

export function getAffiliateUrl(amazonUrl) {
  if (!amazonUrl || typeof amazonUrl !== 'string') {
    return `https://www.amazon.in/?tag=${AFFILIATE_TAG}`;
  }

  try {
    const url = new URL(amazonUrl);
    // Add or replace the 'tag' query parameter
    url.searchParams.set("tag", AFFILIATE_TAG);
    return url.toString();
  } catch (error) {
    // Fallback if URL is invalid (should not happen with proper data)
    return `${amazonUrl}${amazonUrl.includes("?") ? "&" : "?"}tag=${AFFILIATE_TAG}`;
  }
}

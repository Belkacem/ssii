/**
 * Fetch an entry from URL params
 * @param name the param name to fetch
 * @param search the search part from react router location
 */
export const getUrlParameter = (name: string, search: string) => {
  const searchParams = new URLSearchParams(search);
  return searchParams.get(name);
};

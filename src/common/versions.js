/*
* tags: Array<TaggedVersion>
* tagFilter: Array<string>
*/
export function tagFilter(tags, tagFilter) {
  // just show all distTags if no filters found
  if (!tagFilter || tagFilter.length === 0)
    return tags;

  // get the dist tag filter from the config
  const tagFilters = tagFilter.map(entry => entry.toLowerCase()); // make sure the filters are all lower case

  // if there isn't any tags in the filter then return all of them
  if (tagFilters.length === 0)
    return tags;

  // return the filtered tags
  return tags.filter(tag => {
    const checkTagName = tag.name.toLowerCase();
    return tagFilters.includes(checkTagName);
  });
}
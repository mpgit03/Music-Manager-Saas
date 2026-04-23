export const buildSearchQuery = (track) => {
  if (!track) return "";

  const cleanTitle = track.title
    .replace(/\(.*?\)/g, "")   // remove (feat. ...)
    .replace(/\[.*?\]/g, "")   // remove [remix]
    .trim();

  return `${cleanTitle} ${track.artists.join(" ")} official audio`;
};
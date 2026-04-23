import { buildSearchQuery } from "./queryBuilder.js";

export const normalizePlaylistTrack = (track)=>{
    if(!track) return null;
   

    return {
        title:track.name,
        artists : track.artists.map((a)=>a.name),
        album:track.album.name,
        duration_ms:track.duration_ms,
        spotifyId:track.id,
        isrc:track.external_ids.isrc|| null,
    };
    
}

export const normalizePlaylistTracks = (items) => {
  if (!items) return [];

  return items
    .map((entry) => {
      const track = entry.item; 

      if (!track) return null;

      return normalizePlaylistTrack(track);
    })
    .filter(Boolean);
};
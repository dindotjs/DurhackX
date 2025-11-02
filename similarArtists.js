function similarArtists(artists1, artists2) {
    out = [];
    for (let artist of artists1) {
        for (let artist2 of artists2) {
            if (artist.id === artist2.id) {
                out.push(artist);
            }
        }
    }
    return out;
}
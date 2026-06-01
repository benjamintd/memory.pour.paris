# Data sources

https://opendata.paris.fr/explore/dataset/voie/information/
https://data.iledefrance-mobilites.fr/explore/dataset/emplacement-des-gares-idf/information/
https://data.iledefrance-mobilites.fr/explore/dataset/traces-du-reseau-ferre-idf/information/
https://fr.wikipedia.org/wiki/Mod%C3%A8le:M%C3%A9tro_de_Paris/couleur_fond
https://commons.wikimedia.org/wiki/Template:Paris_transit_icons


# Map rendering

The map uses **MapLibre GL** with a token-free base style defined in
`src/lib/mapStyle.ts`:

- Vector tiles: Protomaps hosted API (the key is origin-locked to `localhost` and
  `memory.pour.paris`, so it ships client-side — no Mapbox account or token needed).
- Glyphs: self-hosted Jost (`benjamintd.github.io/fonts/Jost`).
- Sprites: Protomaps basemap assets.

The Île-de-France rail network (mask, line traces, stations) is rendered from local
geojson served out of `public/data/` (`idf-mask.geojson`,
`traces-du-reseau-ferre-idf.geojson`, `emplacement-des-gares-idf.geojson`) — it is no
longer baked into a Mapbox-hosted style.

Updating the data:
- Download the datasets from IDFM
- `bun run src/scripts/preprocess-idf.ts`
- `bun run src/scripts/convert-traces.ts`
- Copy the refreshed `src/data/*.geojson` network files into `public/data/`


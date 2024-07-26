# Data sources

https://opendata.paris.fr/explore/dataset/voie/information/
https://data.iledefrance-mobilites.fr/explore/dataset/emplacement-des-gares-idf/information/
https://data.iledefrance-mobilites.fr/explore/dataset/traces-du-reseau-ferre-idf/information/
https://fr.wikipedia.org/wiki/Mod%C3%A8le:M%C3%A9tro_de_Paris/couleur_fond
https://commons.wikimedia.org/wiki/Template:Paris_transit_icons


Updating the data: 
- Download the datasets from IDFM 
- upload features and routes to mapbox to replace existing sets
- `bun run src/scripts/preprocess-idf.ts`
- `bun run src/scripts/convert-traces.ts`


# `discard`

This is a script to create the grouped polygons from the raw set of all postnummer polygon data.
This is named "discard" after the strategy:

1. Build the graph
2. Find the shared edges
3. **Discard** those edges
4. Reassemble the polygon(s)

## Setup

Before this script can be run, the data file needs to be recreated:

```sh
cd ../../data/
gunzip postnummer.min.json
```

## Execution

```sh
ts-node index.ts
```

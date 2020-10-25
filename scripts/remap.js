const fs = require('fs');
const epsg = require('epsg-index/all.json');
const proj4 = require('proj4');

const args = process.argv;
if (args.length < 3) {
  console.error('Expecting an input file');
  process.exit(1);
}

const input = args[2];

const getJsonData = (name) => {
  try {
    return require(`${__dirname}/../public/administrative_enheter.${name}.json`);
  } catch (e1) {
    try {
      return require(`${__dirname}/../public/${name}.json`);
    } catch (e2) {
      try {
        return require(`${__dirname}/../public/${name}`);
      } catch (e3) {
        try {
          return require(name);
        } catch (e4) {
          console.error('Could not load the JSON file');
          process.exit(1);
        }
      }
    }
  }
};

const leadingEPSG = /^epsg:/i;

const transform = (from, to, coords) => {
  if ('string' !== typeof from) throw new Error('from must be a string');
  from = from.replace(leadingEPSG, '');
  // @ts-ignore
  const fromEPSG = epsg[from];
  if (!fromEPSG)
    throw new Error(from + ' is not a valid EPSG coordinate system');

  if ('string' !== typeof to) throw new Error('to must be a string');
  to = to.replace(leadingEPSG, '');
  // @ts-ignore
  const toEPSG = epsg[to];
  if (!toEPSG) throw new Error(to + ' is not a valid EPSG coordinate system');

  return proj4(fromEPSG.proj4, toEPSG.proj4, coords);
};

const transformCoords = (coords) => {
  return transform('25833', '4326', coords);
};

const geojson = getJsonData(input);
geojson.features = geojson.features.map((feature) => {
  feature.geometry.coordinates = feature.geometry.coordinates.map((list) => {
    return list.map(transformCoords);
  });
  return feature;
});

fs.writeFileSync(
  `${__dirname}/../public/${args[3] || input}.json`,
  JSON.stringify(geojson, null, 2)
);
process.exit(0);

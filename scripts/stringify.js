const fs = require('fs');
const args = process.argv;
if (args.length < 3) {
  throw new Error('Not enough arguments');
}

const input = args[2];
const output = args[3] || `${input}-out`;

const source = require(`${__dirname}/../public/${input}.json`);

const { features } = source;
source.features = features.map((feature) => {
  const {
    properties: { postnummer },
  } = feature;
  let str = String(postnummer);
  while (str.length < 4) {
    str = `0${str}`;
  }
  return {
    ...feature,
    properties: {
      ...feature.properties,
      postnummer: str,
    },
  };
});

fs.writeFileSync(
  `${__dirname}/../public/${output}.json`,
  JSON.stringify(source, null, 2)
);

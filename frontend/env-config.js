// this is a script that will make sure angular uses the correct api ports
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, "../backend/.env") });

const targetPath = path.resolve(
  __dirname,
  "../frontend/src/environment.ts"
);

const envConfigFile = `
export const environment = {
    production: true,
    environment: '${process.env.ENVIRONMENT}',
    ENGINE_PORT: ${process.env.DJANGO_ENGINE_PORT},
    DOMAINS_PORT: ${process.env.DJANGO_DOMAINS_PORT},
    PROFILES_PORT: ${process.env.DJANGO_PROFILES_PORT},
    SOURCECONNECTOR_PORT: ${process.env.DJANGO_SOURCECONNECTOR_PORT},
    WAREHOUSE_PORT: ${process.env.DJANGO_WAREHOUSE_PORT},
    SAS: '${process.env.AZURE_SAS}',
};
`;

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }
  console.log(
    `Angular environment.ts file generated correctly at ${targetPath} \n`
  );
});

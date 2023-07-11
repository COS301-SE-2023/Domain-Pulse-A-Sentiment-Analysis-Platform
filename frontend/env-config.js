// this is a script that will make sure angular uses the correct api ports
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file
const envFilePath = path.resolve(__dirname, "../backend/.env");
const envFileContent = fs.readFileSync(envFilePath, "utf8");

const environment = envFileContent.split("\r\n").reduce((env, line) => {
  const [key, value] = line.split("=");
  env[key] = value;
  return env;
}, {});

const targetPath = path.resolve(
  __dirname,
  "../frontend/src/environment.ts"
);

const envConfigFile = `
export const environment = {
    production: true,
    environment: '${environment.ENVIRONMENT}',
    ENGINE_PORT: ${environment.DJANGO_ENGINE_PORT},
    DOMAINS_PORT: ${environment.DJANGO_DOMAINS_PORT},
    PROFILES_PORT: ${environment.DJANGO_PROFILES_PORT},
    SOURCECONNECTOR_PORT: ${environment.DJANGO_SOURCECONNECTOR_PORT},
    WAREHOUSE_PORT: ${environment.DJANGO_WAREHOUSE_PORT},
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

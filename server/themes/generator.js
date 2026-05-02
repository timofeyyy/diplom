const fs = require('fs');
const path = require('path');

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, '/api.json'), 'utf-8')
);

const appThemes = data['app-themes'];
const mainThemes = {
  light: data.light,
  dark: data.dark,
};


let scss = `$themes: (\n`;

appThemes.forEach((theme, index) => {
  scss += `  ${theme.name}: (\n`;
  Object.entries(theme.colors).forEach(([key, value]) => {
    scss += `    ${key}: ${value},\n`;
  });
  scss += `  )${index !== appThemes.length - 1 ? ',' : ''}\n`;
});

scss += `);\n`;

fs.writeFileSync(
  path.join(__dirname, '../../client/src/themes/themes.scss'),
  scss
);


let appThemesTs = `
export const APP_THEMES = ${JSON.stringify(appThemes, null, 2)};
export const DEFAULT_APP_THEME = "${appThemes[0].name}";
`;

fs.writeFileSync(
  path.join(__dirname, '../../client/src/themes/app-themes.ts'),
  appThemesTs
);


let mainThemesTs = `
export const MAIN_THEMES = ${JSON.stringify(mainThemes, null, 2)};
export const DEFAULT_MAIN_THEME = "dark";
`;

fs.writeFileSync(
  path.join(__dirname, '../../client/src/themes/main-themes.ts'),
  mainThemesTs
);

// console.log('Темы успешно сгенерированы');
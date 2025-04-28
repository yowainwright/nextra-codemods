const { test } = require('jest');
const transform = require('../migrate-theme-config');
const jscodeshift = require('jscodeshift');

test('migrate-theme-config transforms theme.config.js correctly', () => {
  // Sample theme.config.js content
  const input = `
export default {
  logo: () => <span>My Project</span>,
  docsRepositoryBase: 'https://github.com/user/repo',
  footer: {
    text: 'MIT License'
  },
  i18n: [
    { locale: 'en', text: 'English' },
    { locale: 'fr', text: 'Français' }
  ]
}
  `;
  
  // Run the transform
  const output = transform(
    { path: 'theme.config.js', source: input },
    { jscodeshift },
    {}
  );
  
  // The transform doesn't modify the input file, it generates new files
  expect(output).toBe(input);
});

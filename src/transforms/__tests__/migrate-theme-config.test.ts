import { test, expect } from 'jest';
import transform from '../migrate-theme-config';
import jscodeshift from 'jscodeshift';
import fs from 'fs';

// Mock fs module to avoid writing files during tests
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(false),
  mkdirSync: jest.fn(),
}));

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
  
  // Verify fs.writeFileSync was called with the correct arguments
  expect(fs.writeFileSync).toHaveBeenCalled();
  
  // Get the first call arguments
  const layoutCallArgs = fs.writeFileSync.mock.calls.find(
    call => call[0].includes('layout.jsx')
  );
  
  // Check if layout file contains expected content
  expect(layoutCallArgs[1]).toContain('My Project');
  expect(layoutCallArgs[1]).toContain('MIT License');
  expect(layoutCallArgs[1]).toContain('github.com/user/repo');
});

test('migrate-theme-config handles components property correctly', () => {
  // Sample theme.config.js with components
  const input = `
export default {
  logo: () => <span>My Project</span>,
  components: {
    h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
    pre: ({ children }) => <pre className="custom-pre">{children}</pre>
  }
}
  `;
  
  // Run the transform
  transform(
    { path: 'theme.config.js', source: input },
    { jscodeshift },
    {}
  );
  
  // Verify mdx-components.jsx was created
  const mdxComponentsCallArgs = fs.writeFileSync.mock.calls.find(
    call => call[0].includes('mdx-components.jsx')
  );
  
  expect(mdxComponentsCallArgs).toBeTruthy();
  expect(mdxComponentsCallArgs[1]).toContain('custom-h1');
  expect(mdxComponentsCallArgs[1]).toContain('custom-pre');
});

// Reset mock between tests
afterEach(() => {
  jest.clearAllMocks();
});

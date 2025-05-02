import transform from '../src/transforms/migrate-theme-config';
import jscodeshift from 'jscodeshift';
import * as fs from 'fs';

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
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    {}
  );
  
  // The transform doesn't modify the input file, it generates new files
  expect(output).toBe(input);
  
  // Verify fs.writeFileSync was called
  expect(fs.writeFileSync).toHaveBeenCalled();
  
  // Just check that writeFileSync was called with the right file paths
  const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
  const layoutFileCall = writeFileCalls.find(call => 
    typeof call[0] === 'string' && call[0].includes('layout')
  );
  
  expect(layoutFileCall).toBeTruthy();
});

test('migrate-theme-config handles components property correctly', () => {
  // Reset mocks
  jest.clearAllMocks();
  
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
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    {}
  );
  
  // Verify mdx-components.jsx was created
  const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
  const mdxComponentsCall = writeFileCalls.find(call => 
    typeof call[0] === 'string' && call[0].includes('mdx-components')
  );
  
  expect(mdxComponentsCall).toBeTruthy();
});

// Reset mock between tests
afterEach(() => {
  jest.clearAllMocks();
});

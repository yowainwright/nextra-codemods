import transform from '../src/transforms/migrate-mdx-components';
import jscodeshift from 'jscodeshift';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(false),
}));

test('migrate-mdx-components creates mdx-components.jsx for docs theme', () => {
  // Sample theme.config.js with components for docs theme
  const input = `
export default {
  components: {
    h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
    code: ({ children }) => <code className="custom-code">{children}</code>
  }
}
  `;
  
  // Run the transform
  transform(
    { path: 'theme.config.js', source: input },
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    { projectRoot: '/' }
  );
  
  // Verify mdx-components.jsx was created
  expect(fs.writeFileSync).toHaveBeenCalled();
  const args = (fs.writeFileSync as jest.Mock).mock.calls[0];
  expect(args[0]).toBe('/mdx-components.jsx');
  // Just check that it contains some expected content without being too specific
  expect(args[1]).toContain('useMDXComponents');
});

test('migrate-mdx-components skips non-theme.config files', () => {
  // Reset mocks
  jest.clearAllMocks();
  
  // Run the transform on a non-theme.config file
  transform(
    { path: 'some-other-file.js', source: 'export default {}' },
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    {}
  );
  
  // Verify no file was created
  expect(fs.writeFileSync).not.toHaveBeenCalled();
});

// Reset mock between tests
afterEach(() => {
  jest.clearAllMocks();
});

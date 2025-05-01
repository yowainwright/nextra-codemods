import { test, expect } from'jest';
import transform from'../migrate-mdx-components';
import jscodeshift from 'jscodeshift';
import fs from 'fs';

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
    { jscodeshift },
    { projectRoot: '/' }
  );
  
  // Verify mdx-components.jsx was created with docs theme
  expect(fs.writeFileSync).toHaveBeenCalled();
  const args = fs.writeFileSync.mock.calls[0];
  expect(args[0]).toBe('/mdx-components.jsx');
  expect(args[1]).toContain('nextra-theme-docs');
  expect(args[1]).toContain('getDocsMDXComponents');
});

test('migrate-mdx-components creates mdx-components.jsx for blog theme', () => {
  // Sample theme.config.js with components for blog theme
  const input = `
export default {
  theme: 'nextra-theme-blog',
  components: {
    h1: ({ children }) => <h1 className="custom-h1">{children}</h1>
  }
}
  `;
  
  // Run the transform
  transform(
    { path: 'theme.config.js', source: input },
    { jscodeshift },
    { projectRoot: '/' }
  );
  
  // Verify mdx-components.jsx was created with blog theme
  expect(fs.writeFileSync).toHaveBeenCalled();
  const args = fs.writeFileSync.mock.calls[0];
  expect(args[0]).toBe('/mdx-components.jsx');
  expect(args[1]).toContain('nextra-theme-blog');
  expect(args[1]).toContain('getBlogMDXComponents');
});

test('migrate-mdx-components skips non-theme.config files', () => {
  // Run the transform on a non-theme.config file
  transform(
    { path: 'some-other-file.js', source: 'export default {}' },
    { jscodeshift },
    {}
  );
  
  // Verify no file was created
  expect(fs.writeFileSync).not.toHaveBeenCalled();
});

// Reset mock between tests
afterEach(() => {
  jest.clearAllMocks();
});
import { test, expect } from 'jest';
import transform from '../setup-search';
import jscodeshift from 'jscodeshift';
import fs from'fs';

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockImplementation((path) => {
    if (path.includes('package.json')) {
      return JSON.stringify({
        name: "nextra-project",
        dependencies: {
          "next": "^13.0.0",
          "nextra": "^3.0.0",
          "nextra-theme-docs": "^3.0.0"
        }
      });
    }
    return '';
  }),
}));

test('setup-search adds pagefind to package.json', () => {
  // Run the transform
  transform(
    { path: '/project/package.json', source: '' },
    { jscodeshift },
    {}
  );
  
  // Verify package.json was updated
  expect(fs.writeFileSync).toHaveBeenCalled();
  
  // Get the first call arguments
  const args = fs.writeFileSync.mock.calls[0];
  
  // Check if pagefind was added
  const updatedPackageJson = JSON.parse(args[1]);
  expect(updatedPackageJson.dependencies.pagefind).toBeTruthy();
});

test('setup-search skips non-package.json files', () => {
  // Run the transform on a non-package.json file
  transform(
    { path: '/project/some-other-file.js', source: '' },
    { jscodeshift },
    {}
  );
  
  // Verify no files were updated
  expect(fs.writeFileSync).not.toHaveBeenCalled();
});

// Reset mock between tests
afterEach(() => {
  jest.clearAllMocks();
});
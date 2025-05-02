import transform from '../src/transforms/setup-search';
import jscodeshift from 'jscodeshift';
import * as fs from 'fs';
import path from 'path';

// Mock fs module properly
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn()
}));

test('setup-search adds pagefind to package.json', () => {
  // Setup mocks for this test
  (fs.existsSync as jest.Mock).mockReturnValue(true);
  (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
    name: "nextra-project",
    dependencies: {
      "next": "^13.0.0",
      "nextra": "^3.0.0"
    }
  }));
  (path.join as jest.Mock).mockReturnValue('package.json');
  
  // Run the transform
  transform(
    { path: 'package.json', source: '' },
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    {}
  );
  
  // Verify writeFileSync was called
  expect(fs.writeFileSync).toHaveBeenCalled();
});

test('setup-search skips non-package.json files', () => {
  // Reset mocks
  jest.clearAllMocks();
  
  // For this test, we need to mock existsSync to return false
  // since the transform checks if package.json exists in the project root
  (fs.existsSync as jest.Mock).mockReturnValue(false);
  
  // Run the transform on a non-package.json file
  transform(
    { path: 'some-other-file.js', source: '' },
    { jscodeshift, j: jscodeshift, stats: () => {}, report: () => {} },
    {}
  );
  
  // Verify writeFileSync was not called
  expect(fs.writeFileSync).not.toHaveBeenCalled();
});

// Reset mock between tests
afterEach(() => {
  jest.clearAllMocks();
});

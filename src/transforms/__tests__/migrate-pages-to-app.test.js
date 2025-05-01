const { test, expect } = require('jest');
const transform = require('../migrate-pages-to-app');
const jscodeshift = require('jscodeshift');
const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(false),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn().mockImplementation((path) => {
    if (path.includes('index.mdx')) {
      return '# Home Page';
    }
    if (path.includes('docs/getting-started.mdx')) {
      return '# Getting Started';
    }
    return '';
  }),
}));

// Mock path module
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  resolve: jest.fn().mockImplementation((...args) => args.join('/')),
  dirname: jest.fn().mockImplementation((p) => p.split('/').slice(0, -1).join('/')),
  basename: jest.fn().mockImplementation((p) => p.split('/').pop()),
}));

test('migrate-pages-to-app transforms pages directory correctly', () => {
  // Sample pages file
  const input = `
import { useRouter } from 'next/router'

# Welcome to Nextra

This is a basic docs template.
  `;
  
  // Run the transform
  transform(
    { path: '/project/pages/index.mdx', source: input },
    { jscodeshift },
    { projectRoot: '/project' }
  );
  
  // Verify app directory and files were created
  expect(fs.mkdirSync).toHaveBeenCalled();
  expect(fs.writeFileSync).toHaveBeenCalled();
  
  // Check if the correct files were created
  const writeFileCalls = fs.writeFileSync.mock.calls.map(call => call[0]);
  expect(writeFileCalls.some(path => path.includes('app/page'))).toBeTruthy();
});

test('migrate-pages-to-app skips non-pages files', () => {
  // Run the transform on a non-pages file
  transform(
    { path: '/project/src/utils.js', source: 'export default {}' },
    { jscodeshift },
    { projectRoot: '/project' }
  );
  
  // Verify no files were created
  expect(fs.mkdirSync).not.toHaveBeenCalled();
  expect(fs.writeFileSync).not.toHaveBeenCalled();
});

// Reset mock between tests
afterEach(() => {
  jest.clearAllMocks();
});
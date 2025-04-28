# Tiltfile for testing Nextra v3 to v4 codemods

# Define the test environment directory
test_env_dir = './test-env'

# Clone the Nextra v3 example repository if it doesn't exist
local_resource(
    'clone-nextra-v3-example',
    cmd='[ -d {}/with-nextra-3 ] || git clone --depth 1 https://github.com/code-hike/examples.git {} && cp -r {}/examples/with-nextra-3 {}/with-nextra-3'.format(
        test_env_dir, test_env_dir, test_env_dir, test_env_dir
    ),
    deps=[],
    resource_deps=[],
)

# Create a backup of the original Nextra v3 project
local_resource(
    'backup-nextra-v3',
    cmd='[ -d {}/with-nextra-3-backup ] || cp -r {}/with-nextra-3 {}/with-nextra-3-backup'.format(
        test_env_dir, test_env_dir, test_env_dir
    ),
    deps=[],
    resource_deps=['clone-nextra-v3-example'],
)

# Install dependencies for the Nextra v3 project
local_resource(
    'install-nextra-v3-deps',
    cmd='cd {}/with-nextra-3 && npm install'.format(test_env_dir),
    deps=['{}/with-nextra-3/package.json'.format(test_env_dir)],
    resource_deps=['backup-nextra-v3'],
)

# Run the Nextra v3 project
local_resource(
    'run-nextra-v3',
    cmd='cd {}/with-nextra-3 && npm run dev'.format(test_env_dir),
    deps=[
        '{}/with-nextra-3/pages'.format(test_env_dir),
        '{}/with-nextra-3/theme.config.jsx'.format(test_env_dir),
        '{}/with-nextra-3/next.config.mjs'.format(test_env_dir),
    ],
    resource_deps=['install-nextra-v3-deps'],
    serve_cmd='cd {}/with-nextra-3 && npm run dev'.format(test_env_dir),
    serve_env={'PORT': '3000'},
    links=[link('http://localhost:3000', 'Nextra v3 App')],
)

# Create a directory for the migrated Nextra v4 project
local_resource(
    'create-nextra-v4-dir',
    cmd='mkdir -p {}/with-nextra-4'.format(test_env_dir),
    deps=[],
    resource_deps=['backup-nextra-v3'],
)

# Apply the migrate-theme-config codemod
local_resource(
    'apply-migrate-theme-config',
    cmd='node index.js migrate-theme-config {}/with-nextra-3/theme.config.jsx'.format(test_env_dir),
    deps=[
        'src/transforms/migrate-theme-config.js',
        '{}/with-nextra-3/theme.config.jsx'.format(test_env_dir),
    ],
    resource_deps=['create-nextra-v4-dir'],
)

# Apply the migrate-pages-to-app codemod
local_resource(
    'apply-migrate-pages-to-app',
    cmd='node index.js migrate-pages-to-app {}/with-nextra-3/pages'.format(test_env_dir),
    deps=[
        'src/transforms/migrate-pages-to-app.js',
        '{}/with-nextra-3/pages'.format(test_env_dir),
    ],
    resource_deps=['apply-migrate-theme-config'],
)

# Apply the setup-search codemod
local_resource(
    'apply-setup-search',
    cmd='node index.js setup-search {}/with-nextra-3/package.json'.format(test_env_dir),
    deps=[
        'src/transforms/setup-search.js',
        '{}/with-nextra-3/package.json'.format(test_env_dir),
    ],
    resource_deps=['apply-migrate-pages-to-app'],
)

# Apply the migrate-mdx-components codemod
local_resource(
    'apply-migrate-mdx-components',
    cmd='node index.js migrate-mdx-components {}/with-nextra-3/theme.config.jsx'.format(test_env_dir),
    deps=[
        'src/transforms/migrate-mdx-components.js',
        '{}/with-nextra-3/theme.config.jsx'.format(test_env_dir),
    ],
    resource_deps=['apply-setup-search'],
)

# Copy the migrated files to the Nextra v4 directory
local_resource(
    'copy-migrated-files',
    cmd='cp -r {}/with-nextra-3/* {}/with-nextra-4/'.format(test_env_dir, test_env_dir),
    deps=[],
    resource_deps=['apply-migrate-mdx-components'],
)

# Update the package.json for Nextra v4
local_resource(
    'update-nextra-v4-package-json',
    cmd='''
    cd {}/with-nextra-4 && 
    npm uninstall nextra nextra-theme-docs &&
    npm install nextra@latest nextra-theme-docs@latest next@latest
    '''.format(test_env_dir),
    deps=['{}/with-nextra-4/package.json'.format(test_env_dir)],
    resource_deps=['copy-migrated-files'],
)

# Run the migrated Nextra v4 project
local_resource(
    'run-nextra-v4',
    cmd='cd {}/with-nextra-4 && npm run dev'.format(test_env_dir),
    deps=[
        '{}/with-nextra-4/app'.format(test_env_dir),
        '{}/with-nextra-4/mdx-components.jsx'.format(test_env_dir),
    ],
    resource_deps=['update-nextra-v4-package-json'],
    serve_cmd='cd {}/with-nextra-4 && npm run dev'.format(test_env_dir),
    serve_env={'PORT': '3001'},
    links=[link('http://localhost:3001', 'Nextra v4 App')],
)

# Reset the test environment
local_resource(
    'reset-test-env',
    cmd='rm -rf {}/with-nextra-3/* && cp -r {}/with-nextra-3-backup/* {}/with-nextra-3/'.format(
        test_env_dir, test_env_dir, test_env_dir
    ),
    deps=[],
    resource_deps=[],
    auto_init=False,
)

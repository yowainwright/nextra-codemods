#!/bin/bash

# Script to test Nextra v3 to v4 codemods

# Set up the test environment
setup_test_env() {
  echo "Setting up test environment..."
  
  # Create test-env directory if it doesn't exist
  mkdir -p test-env
  
  # Clone the Nextra v3 example repository if it doesn't exist
  if [ ! -d "test-env/with-nextra-3" ]; then
    echo "Cloning Nextra v3 example repository..."
    git clone --depth 1 https://github.com/code-hike/examples.git test-env/examples
    cp -r test-env/examples/with-nextra-3 test-env/with-nextra-3
  fi
  
  # Create a backup of the original Nextra v3 project
  if [ ! -d "test-env/with-nextra-3-backup" ]; then
    echo "Creating backup of Nextra v3 project..."
    cp -r test-env/with-nextra-3 test-env/with-nextra-3-backup
  fi
  
  # Install dependencies for the Nextra v3 project
  echo "Installing dependencies for Nextra v3 project..."
  cd test-env/with-nextra-3 && npm install
  cd ../../
  
  # Create a directory for the migrated Nextra v4 project
  mkdir -p test-env/with-nextra-4
}

# Apply codemods to the Nextra v3 project
apply_codemods() {
  echo "Applying codemods to Nextra v3 project..."
  
  # Apply the migrate-theme-config codemod
  echo "Applying migrate-theme-config codemod..."
  node index.js migrate-theme-config test-env/with-nextra-3/theme.config.jsx
  
  # Apply the migrate-pages-to-app codemod
  echo "Applying migrate-pages-to-app codemod..."
  node index.js migrate-pages-to-app test-env/with-nextra-3/pages
  
  # Apply the setup-search codemod
  echo "Applying setup-search codemod..."
  node index.js setup-search test-env/with-nextra-3/package.json
  
  # Apply the migrate-mdx-components codemod
  echo "Applying migrate-mdx-components codemod..."
  node index.js migrate-mdx-components test-env/with-nextra-3/theme.config.jsx
}

# Copy the migrated files to the Nextra v4 directory
copy_migrated_files() {
  echo "Copying migrated files to Nextra v4 directory..."
  cp -r test-env/with-nextra-3/* test-env/with-nextra-4/
}

# Update the package.json for Nextra v4
update_package_json() {
  echo "Updating package.json for Nextra v4..."
  cd test-env/with-nextra-4 && \
  npm uninstall nextra nextra-theme-docs && \
  npm install nextra@latest nextra-theme-docs@latest next@latest
  cd ../../
}

# Reset the test environment
reset_test_env() {
  echo "Resetting test environment..."
  rm -rf test-env/with-nextra-3/*
  cp -r test-env/with-nextra-3-backup/* test-env/with-nextra-3/
}

# Main function
main() {
  case "$1" in
    setup)
      setup_test_env
      ;;
    apply)
      apply_codemods
      ;;
    copy)
      copy_migrated_files
      ;;
    update)
      update_package_json
      ;;
    reset)
      reset_test_env
      ;;
    all)
      setup_test_env
      apply_codemods
      copy_migrated_files
      update_package_json
      ;;
    *)
      echo "Usage: $0 {setup|apply|copy|update|reset|all}"
      exit 1
      ;;
  esac
}

# Run the main function with the provided argument
main "$1"

#!/bin/bash

# Script to fix the rashid/dev branch by removing secrets from git history
# This will create a new clean branch without the secret

echo "🔧 Fixing rashid/dev branch to remove secrets..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Backup current branch
current_branch=$(git branch --show-current)
print_status "Current branch: $current_branch"

# Check if we're on rashid/dev
if [[ "$current_branch" != "rashid/dev" ]]; then
    print_warning "Switching to rashid/dev branch"
    git checkout rashid/dev
fi

# Create a new clean branch from main with the current changes (without history)
print_status "Creating clean branch rashid/dev-clean from main..."
git checkout main
git checkout -b rashid/dev-clean

# Copy current files from rashid/dev (excluding git history)
print_status "Copying current state of rashid/dev (without problematic history)..."
git checkout rashid/dev -- .

# Ensure config file doesn't have secrets
print_status "Ensuring config file is clean..."
if [[ -f "cea/config.toml" ]]; then
    sed -i.bak 's/API_KEY = "sk-[^"]*"/API_KEY = "your_openai_api_key_here"/' cea/config.toml
    rm -f cea/config.toml.bak
    print_status "Cleaned API keys in config file"
fi

# Stage and commit all files
print_status "Committing clean version..."
git add .
git commit -m "Clean version of rashid/dev without secrets in history

This branch contains all the functionality from rashid/dev but with a clean
git history that doesn't contain any API keys or secrets."

# Try to push to both remotes
print_status "Pushing clean branch to remotes..."

if git push dev rashid/dev-clean; then
    print_status "Successfully pushed rashid/dev-clean to dev remote"
else
    print_error "Failed to push to dev remote"
fi

if git push squad4 rashid/dev-clean; then
    print_status "Successfully pushed rashid/dev-clean to squad4 remote"
else
    print_error "Failed to push to squad4 remote"
fi

echo ""
print_warning "Next steps:"
print_warning "1. Verify the new branch rashid/dev-clean works correctly"
print_warning "2. If everything looks good, you can:"
print_warning "   - Delete the old rashid/dev branch: git branch -D rashid/dev"
print_warning "   - Rename the clean branch: git branch -m rashid/dev-clean rashid/dev"
print_warning "   - Force push to replace the old branch (use with caution):"
print_warning "     git push --force-with-lease dev rashid/dev"
print_warning "     git push --force-with-lease squad4 rashid/dev"
echo ""
print_status "Clean branch created successfully!" 

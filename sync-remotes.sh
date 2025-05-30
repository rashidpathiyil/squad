#!/bin/bash

# Script to sync all branches between dev and squad4 remotes
# Usage: ./sync-remotes.sh

echo "🔄 Starting remote sync process..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Fetch all updates from both remotes
echo "📥 Fetching updates from all remotes..."
git fetch dev
git fetch squad4

print_status "Fetched updates from both remotes"

# Get list of all remote branches
echo "🔍 Analyzing branches..."
dev_branches=$(git branch -r | grep "dev/" | sed 's/.*dev\///' | grep -v HEAD)
squad4_branches=$(git branch -r | grep "squad4/" | sed 's/.*squad4\///' | grep -v HEAD)

# Combine and get unique branches
all_branches=$(echo -e "$dev_branches\n$squad4_branches" | sort | uniq)

echo "📋 Found branches to sync:"
echo "$all_branches"

# Function to sync a branch
sync_branch() {
    local branch=$1
    echo "🔄 Syncing branch: $branch"
    
    # Check if branch exists on both remotes
    dev_has=$(git branch -r | grep -c "dev/$branch" || echo 0)
    squad4_has=$(git branch -r | grep -c "squad4/$branch" || echo 0)
    
    if [[ $dev_has -gt 0 && $squad4_has -gt 0 ]]; then
        # Both remotes have the branch - sync the latest
        print_warning "Branch $branch exists on both remotes - checking which is ahead"
        
        # Create/update local branch
        git checkout -B "$branch" "squad4/$branch" 2>/dev/null || git checkout -B "$branch" "dev/$branch" 2>/dev/null
        
        # Try to push to both remotes
        if git push dev "$branch" 2>/dev/null; then
            print_status "Pushed $branch to dev remote"
        else
            print_error "Failed to push $branch to dev remote (may need manual resolution)"
        fi
        
        if git push squad4 "$branch" 2>/dev/null; then
            print_status "Pushed $branch to squad4 remote"
        else
            print_error "Failed to push $branch to squad4 remote (may need manual resolution)"
        fi
        
    elif [[ $dev_has -gt 0 ]]; then
        # Only dev has it - push to squad4
        print_status "Branch $branch only exists on dev - syncing to squad4"
        git checkout -B "$branch" "dev/$branch"
        if git push squad4 "$branch"; then
            print_status "Successfully synced $branch from dev to squad4"
        else
            print_error "Failed to sync $branch from dev to squad4"
        fi
        
    elif [[ $squad4_has -gt 0 ]]; then
        # Only squad4 has it - push to dev
        print_status "Branch $branch only exists on squad4 - syncing to dev"
        git checkout -B "$branch" "squad4/$branch"
        if git push dev "$branch"; then
            print_status "Successfully synced $branch from squad4 to dev"
        else
            print_error "Failed to sync $branch from squad4 to dev"
        fi
    fi
}

# Sync each branch
for branch in $all_branches; do
    if [[ ! -z "$branch" ]]; then
        sync_branch "$branch"
    fi
done

# Return to main branch
git checkout main

echo ""
print_status "Sync process completed!"
echo ""
print_warning "If any branches failed to sync due to secrets or conflicts, you may need to:"
print_warning "1. Use git filter-branch or BFG to remove secrets from history"
print_warning "2. Manually resolve conflicts"
print_warning "3. Use --force flag (with caution) if you're sure about overwriting"
echo ""
echo "📊 Current remote status:"
echo "Dev remote branches:"
git branch -r | grep "dev/" | sed 's/.*dev\//  /'
echo ""
echo "Squad4 remote branches:"
git branch -r | grep "squad4/" | sed 's/.*squad4\//  /' 

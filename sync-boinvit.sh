#!/bin/bash

# Boinvit - Git sync script
# This script helps with git operations for the boinvit project

set -e  # Exit on error

# Text formatting
bold=$(tput bold)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
blue=$(tput setaf 4)
red=$(tput setaf 1)
reset=$(tput sgr0)

# Function to print section headers
section() {
    echo "${bold}${blue}=== $1 ===${reset}"
}

# Function to print success messages
success() {
    echo "${green}✓ $1${reset}"
}

# Function to print info messages
info() {
    echo "${yellow}ℹ $1${reset}"
}

# Function to print error messages
error() {
    echo "${red}✗ $1${reset}"
}

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    error "Not in a git repository. Please run this script from the root of the boinvit project."
    exit 1
fi

# Check for uncommitted changes
section "Checking for uncommitted changes"
if [[ -n "$(git status --porcelain)" ]]; then
    info "You have uncommitted changes. Please commit or stash them before proceeding."
    git status -s
    
    read -p "Do you want to commit these changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter commit message: " commit_message
        git add .
        git commit -m "$commit_message"
        success "Changes committed."
    else
        info "Changes not committed. Please handle them manually."
        exit 0
    fi
else
    success "Working directory clean."
fi

# Fetch updates
section "Fetching updates from remote"
git fetch
success "Fetched updates from remote."

# Check for new updates
section "Checking for updates"
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ $LOCAL = $REMOTE ]; then
    success "Up-to-date."
elif [ $LOCAL = $BASE ]; then
    info "New updates available. Need to pull."
    
    # Pull updates
    section "Pulling updates"
    git pull
    success "Updates pulled successfully."
    
    # Install dependencies if package.json changed
    if git diff --name-only HEAD@{1} | grep -q "package.json"; then
        section "Package.json changed. Installing dependencies..."
        npm install
        success "Dependencies installed."
    fi
    
    # Run type checking
    section "Running type checking"
    npm run typecheck || true
    success "Type checking completed."
elif [ $REMOTE = $BASE ]; then
    info "You have unpushed commits."
    git log @{u}..
    
    read -p "Do you want to push these commits? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        section "Pushing commits"
        git push
        success "Commits pushed successfully."
    else
        info "Commits not pushed. You can push them later manually."
    fi
else
    error "Branches have diverged. Please resolve conflicts manually."
    exit 1
fi

# Optional: start the development server
read -p "Do you want to start the development server? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    section "Starting development server"
    npm run dev
else
    success "All done! Your boinvit project is now up-to-date."
fi

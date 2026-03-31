#!/bin/bash

echo "========================================="
echo "  Game Hub - Deploy to GitHub"
echo "========================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed"
    exit 1
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Configure git user if not set
if [ -z "$(git config user.email)" ]; then
    echo "Configuring git..."
    git config user.email "developer@gamehub.local"
    git config user.name "Game Hub Developer"
fi

# Ask for repository URL
echo ""
echo "Enter your GitHub repository URL:"
echo "(e.g., https://github.com/username/game-hub.git)"
read -r REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "Error: Repository URL is required"
    exit 1
fi

# Add remote
echo "Adding remote origin..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

# Stage all files
echo "Staging files..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit"
else
    # Show status
    echo ""
    echo "Files to be committed:"
    git status --short
    
    # Ask for commit message
    echo ""
    echo "Enter commit message (or press Enter for default):"
    read -r COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Game Hub v1.0 - 20 mini-games PWA"
    fi
    
    # Commit
    echo "Committing..."
    git commit -m "$COMMIT_MSG"
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
echo "========================================="
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  ✓ Successfully deployed!"
    echo "========================================="
    echo ""
    echo "Repository URL: $REPO_URL"
else
    echo ""
    echo "Push failed. Trying with master branch..."
    git push -u origin master
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Successfully deployed to master branch!"
    else
        echo ""
        echo "Error: Push failed. Check your repository URL and permissions."
        exit 1
    fi
fi

echo ""
echo "Done!"

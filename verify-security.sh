#!/bin/bash

# Security Verification Script for Roadmap GENAI
# This script checks if all security measures are in place

echo "🔐 Security Verification Script"
echo "================================="
echo ""

ISSUES_FOUND=0

# Check 1: Verify .env files exist
echo "✓ Checking if .env template files exist..."
if [ -f ".env.template" ]; then
    echo "  ✅ .env.template found"
else
    echo "  ❌ .env.template missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ -f "frontend/.env.template" ]; then
    echo "  ✅ frontend/.env.template found"
else
    echo "  ❌ frontend/.env.template missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# Check 2: Verify .gitignore excludes .env
echo "✓ Checking if .gitignore excludes .env files..."
if grep -q "\.env" .gitignore; then
    echo "  ✅ .gitignore excludes .env files"
else
    echo "  ❌ .gitignore does not exclude .env files"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# Check 3: Search for hardcoded API keys
echo "✓ Checking for hardcoded API keys in source code..."
KEYS_FOUND=$(grep -r "AIza[A-Za-z0-9_-]\{35\}" --include="*.py" --include="*.jsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build . 2>/dev/null | grep -v ".env" | wc -l)

if [ "$KEYS_FOUND" -eq 0 ]; then
    echo "  ✅ No hardcoded API keys found in source code"
else
    echo "  ❌ Found $KEYS_FOUND hardcoded API keys in source code"
    echo "  Files with hardcoded keys:"
    grep -r "AIza[A-Za-z0-9_-]\{35\}" --include="*.py" --include="*.jsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build . 2>/dev/null | grep -v ".env"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# Check 4: Verify .env files are not tracked by git
echo "✓ Checking if .env files are tracked by git..."
ENV_TRACKED=$(git ls-files | grep -E "\.env$|\.env\." | wc -l)

if [ "$ENV_TRACKED" -eq 0 ]; then
    echo "  ✅ No .env files are tracked by git"
else
    echo "  ❌ Found .env files tracked by git:"
    git ls-files | grep -E "\.env$|\.env\."
    echo "  Run: git rm --cached <file> to untrack them"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# Check 5: Verify SECURITY.md exists
echo "✓ Checking if SECURITY.md documentation exists..."
if [ -f "SECURITY.md" ]; then
    echo "  ✅ SECURITY.md found"
else
    echo "  ❌ SECURITY.md missing"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# Check 6: Verify users have created their .env files
echo "✓ Checking if users have created their .env files..."
if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    # Check if it contains placeholder values
    if grep -q "your_.*_api_key_here" .env; then
        echo "  ⚠️  WARNING: .env contains placeholder values"
        echo "     Please add your actual API keys"
    else
        echo "  ✅ .env appears to be configured"
    fi
else
    echo "  ⚠️  .env file not found (run: cp .env.template .env)"
fi

if [ -f "backend/.env" ]; then
    echo "  ✅ backend/.env file exists"
else
    echo "  ⚠️  backend/.env not found"
fi

if [ -f "frontend/.env" ]; then
    echo "  ✅ frontend/.env file exists"
else
    echo "  ⚠️  frontend/.env not found"
fi

echo ""
echo "================================="

if [ $ISSUES_FOUND -eq 0 ]; then
    echo "✅ Security verification PASSED!"
    echo "All security measures are in place."
    exit 0
else
    echo "❌ Security verification FAILED!"
    echo "Found $ISSUES_FOUND issue(s) that need attention."
    exit 1
fi
#!/bin/bash
# Devvit Documentation Sync Script
# Fetches latest API documentation from GitHub and updates local references

set -e

DEVVIT_REPO="reddit/devvit"
DOCS_DIR="docs/devvit-api"
STEERING_DIR=".kiro/steering"

echo "🔄 Syncing Devvit API Documentation..."

# Create docs directory if it doesn't exist
mkdir -p "$DOCS_DIR"

# Fetch RedditAPIClient documentation
echo "📥 Fetching RedditAPIClient documentation..."
curl -s "https://raw.githubusercontent.com/$DEVVIT_REPO/main/devvit-docs/docs/api/redditapi/RedditAPIClient/classes/RedditAPIClient.md" \
  -o "$DOCS_DIR/RedditAPIClient.md"

# Fetch model documentation
echo "📥 Fetching model documentation..."
mkdir -p "$DOCS_DIR/models"

for model in User Post Comment Subreddit WikiPage Widget FlairTemplate ModNote; do
  echo "  - Fetching $model..."
  curl -s "https://raw.githubusercontent.com/$DEVVIT_REPO/main/devvit-docs/docs/api/redditapi/models/classes/$model.md" \
    -o "$DOCS_DIR/models/$model.md" 2>/dev/null || echo "    ⚠️  $model not found"
done

# Update version in steering files
echo "📝 Updating version in steering files..."
CURRENT_DATE=$(date +%Y-%m-%d)
sed -i.bak "s/Last Synced: .*/Last Synced: $CURRENT_DATE/" "$STEERING_DIR/devvit-api-reference.md"
rm -f "$STEERING_DIR/devvit-api-reference.md.bak"

echo "✅ Documentation sync complete!"
echo ""
echo "📁 Files updated:"
echo "  - $DOCS_DIR/RedditAPIClient.md"
echo "  - $DOCS_DIR/models/*.md"
echo "  - $STEERING_DIR/devvit-api-reference.md"
echo ""
echo "💡 Next steps:"
echo "  1. Review changes in $DOCS_DIR"
echo "  2. Update steering files if new methods were added"
echo "  3. Test key methods against Devvit MCP server"

#!/bin/bash
# Run this from inside any client's Vite project folder:
#   bash ~/agency-cms/setup-client.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "=== Agency CMS — Client Setup ==="
echo ""

# 1. Copy the SDK into the client project
echo "Copying cms-sdk into your project..."
rm -rf cms-sdk
cp -r "$SCRIPT_DIR/client-sdk/src" cms-sdk
echo "  Done — cms-sdk/ folder created."

# 2. Install supabase-js if not already present
if ! grep -q '"@supabase/supabase-js"' package.json 2>/dev/null; then
  echo "Installing @supabase/supabase-js..."
  npm install @supabase/supabase-js
  echo "  Done."
else
  echo "  @supabase/supabase-js already installed, skipping."
fi

# 3. Print next steps
echo ""
echo "==================================="
echo "DONE. Now do these 3 things:"
echo ""
echo "1. Add a .env file to this project:"
echo "   VITE_SUPABASE_URL=https://ubkomeuvbrhphmajeltl.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=sb_publishable_K0g3ryJmRO7cB_KeuvXphw_hFcNI68x"
echo ""
echo "2. In your App.jsx, add at the top:"
echo "   import { initCMS, usePageContent, BlockRenderer } from './cms-sdk/index.js'"
echo "   import './cms-sdk/cms-blocks.css'"
echo "   initCMS(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)"
echo ""
echo "3. Inside your component:"
echo "   const { blocks, loading } = usePageContent('YOUR-CLIENT-SLUG', 'home')"
echo "   if (loading) return <p>Loading...</p>"
echo "   return <BlockRenderer blocks={blocks} />"
echo ""
echo "==================================="
echo ""

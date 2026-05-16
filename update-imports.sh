#!/bin/bash

# Update imports from components/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/components/auth/|from "@features/auth/components/|g' {} \;
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/components/common/|from "@components/common/|g' {} \;
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/components/layouts/|from "@components/layouts/|g' {} \;
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/components/features/|from "@components/features/|g' {} \;

# Update imports from features/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/features/|from "@features/|g' {} \;

# Update imports from hooks/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/hooks/|from "@hooks/|g' {} \;

# Update imports from services/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/services/|from "@services/|g' {} \;

# Update imports from utils/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/utils/|from "@utils/|g' {} \;

# Update imports from api/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/api/|from "@api/|g' {} \;

# Update imports from context/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/context/|from "@context/|g' {} \;

# Update imports from i18n/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/i18n/|from "@i18n/|g' {} \;

# Update imports from config/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/config/|from "@config/|g' {} \;

# Update imports from types/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/types/|from "@types/|g' {} \;

# Update imports from assets/
find src -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from ['"'"'"]\.\.?/assets/|from "@assets/|g' {} \;

echo "✅ Import update complete!"

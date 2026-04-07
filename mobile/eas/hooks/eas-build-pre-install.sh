#!/bin/bash

# This hook runs before the build starts to fix incompatible gradle properties
# Remove enableBundleCompression from generated build.gradle as it's not supported in Gradle 8.13+

echo "EAS Build Hook started."

# Set project root if not set
PROJECT_ROOT="${EXPO_PROJECT_ROOT:-$(pwd)}"
echo "Project root: $PROJECT_ROOT"

# Find all build.gradle files and remove enableBundleCompression
echo "Searching for build.gradle files to patch..."
find "$PROJECT_ROOT" -name "build.gradle" -type f | while read -r file; do
    if grep -q "enableBundleCompression" "$file"; then
        echo "Patching $file..."
        sed -i '/enableBundleCompression/d' "$file"
    fi
done

# Check gradle.properties in the android folder
# Path on EAS is typically $PROJECT_ROOT/android/gradle.properties
GRADLE_PROPS="$PROJECT_ROOT/android/gradle.properties"
if [ -f "$GRADLE_PROPS" ]; then
    echo "Found gradle.properties at: $GRADLE_PROPS"
    # Ensure react.disableBundleCompression=true is present
    if ! grep -q "react.disableBundleCompression" "$GRADLE_PROPS"; then
        echo "react.disableBundleCompression=true" >> "$GRADLE_PROPS"
        echo "✓ Added react.disableBundleCompression=true"
    fi
else
    echo "Warning: gradle.properties not found at: $GRADLE_PROPS"
    # Try to find it if path is different
    ALT_PROPS=$(find "$PROJECT_ROOT" -name "gradle.properties" -path "*/android/*" -type f | head -n 1)
    if [ -n "$ALT_PROPS" ]; then
        echo "Found alternative gradle.properties at: $ALT_PROPS"
        if ! grep -q "react.disableBundleCompression" "$ALT_PROPS"; then
            echo "react.disableBundleCompression=true" >> "$ALT_PROPS"
        fi
    fi
fi

exit 0

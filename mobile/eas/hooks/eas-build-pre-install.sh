#!/bin/bash

# This hook runs before the build starts to fix incompatible gradle properties
# Remove enableBundleCompression from generated build.gradle as it's not supported in Gradle 8.13+

echo "EAS Build Hook: Removing enableBundleCompression from build.gradle..."

if [ -f "$EXPO_ANDROID_APP_BUILD_GRADLE_PATH" ]; then
    echo "Found build.gradle at: $EXPO_ANDROID_APP_BUILD_GRADLE_PATH"
    # Remove lines containing enableBundleCompression
    sed -i '/enableBundleCompression/d' "$EXPO_ANDROID_APP_BUILD_GRADLE_PATH"
    echo "✓ Removed enableBundleCompression"
else
    echo "Warning: build.gradle not found at: $EXPO_ANDROID_APP_BUILD_GRADLE_PATH"
fi

# Also ensure the project-level gradle.properties has the right setting
GRADLE_PROPS="/home/expo/workingdir/build/android/gradle.properties"
if [ -f "$GRADLE_PROPS" ]; then
    echo "Checking project gradle.properties..."
    if ! grep -q "react.disableBundleCompression" "$GRADLE_PROPS"; then
        echo "react.disableBundleCompression=true" >> "$GRADLE_PROPS"
        echo "✓ Added react.disableBundleCompression=true to gradle.properties"
    fi
fi

exit 0

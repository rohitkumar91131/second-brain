#!/usr/bin/env node
/**
 * Refactors hardcoded hex color values in Tailwind arbitrary classes to
 * semantic notion-* color class names, enabling dark mode to work.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map of hardcoded hex arbitrary-value classes -> semantic class
const replacements = [
    // Backgrounds
    { from: 'bg-\\[#ffffff\\]', to: 'bg-notion-bg' },
    { from: 'bg-\\[#f7f7f5\\]', to: 'bg-notion-sidebar' },
    { from: 'bg-\\[#efefef\\]', to: 'bg-notion-hover' },
    { from: 'bg-\\[#e9e9e7\\]', to: 'bg-notion-border' },
    { from: 'bg-\\[#fcfcfc\\]', to: 'bg-notion-card' },
    { from: 'bg-white', to: 'bg-notion-bg' },

    // Text
    { from: 'text-\\[#37352f\\]', to: 'text-notion-text' },
    { from: 'text-\\[#9b9a97\\]', to: 'text-notion-muted' },
    { from: 'text-\\[#787774\\]', to: 'text-notion-muted' },
    { from: 'text-\\[#2eaadc\\]', to: 'text-notion-accent' },

    // Borders
    { from: 'border-\\[#e9e9e7\\]', to: 'border-notion-border' },
    { from: 'border-\\[#d3d1cb\\]', to: 'border-notion-border' },

    // Hover backgrounds
    { from: 'hover:bg-\\[#efefef\\]', to: 'hover:bg-notion-hover' },
    { from: 'hover:bg-\\[#f7f7f5\\]', to: 'hover:bg-notion-sidebar' },

    // Hover text
    { from: 'hover:text-\\[#37352f\\]', to: 'hover:text-notion-text' },
    { from: 'hover:border-\\[#d3d1cb\\]', to: 'hover:border-notion-border' },

    // Peer-checked backgrounds (toggles)
    { from: 'peer-checked:bg-\\[#2eaadc\\]', to: 'peer-checked:bg-notion-accent' },

    // Inline styles / inline hex references
    { from: "'#37352f'", to: "'var(--notion-text)'" },
    { from: "'#9b9a97'", to: "'var(--notion-muted)'" },
    { from: "'#787774'", to: "'var(--notion-muted)'" },
    { from: "'#f7f7f5'", to: "'var(--notion-sidebar)'" },
    { from: "'#efefef'", to: "'var(--notion-hover)'" },
    { from: "'#e9e9e7'", to: "'var(--notion-border)'" },
    { from: "'#ffffff'", to: "'var(--notion-bg)'" },
    { from: "'#fcfcfc'", to: "'var(--notion-card)'" },
    { from: '"#37352f"', to: '"var(--notion-text)"' },
    { from: '"#9b9a97"', to: '"var(--notion-muted)"' },
    { from: '"#787774"', to: '"var(--notion-muted)"' },
    { from: '"#f7f7f5"', to: '"var(--notion-sidebar)"' },
    { from: '"#efefef"', to: '"var(--notion-hover)"' },
    { from: '"#e9e9e7"', to: '"var(--notion-border)"' },
    { from: '"#ffffff"', to: '"var(--notion-bg)"' },
    { from: '"#fcfcfc"', to: '"var(--notion-card)"' },
];

function getFiles(dir, ext) {
    const results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !['node_modules', '.next', '.git'].includes(item.name)) {
            results.push(...getFiles(fullPath, ext));
        } else if (item.isFile() && (item.name.endsWith('.jsx') || item.name.endsWith('.js') || item.name.endsWith('.tsx'))) {
            results.push(fullPath);
        }
    }
    return results;
}

const root = path.join(__dirname, '..');
const files = getFiles(path.join(root, 'app'), '.jsx')
    .concat(getFiles(path.join(root, 'components'), '.jsx'));

let totalChanges = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let changed = false;

    for (const { from, to } of replacements) {
        const regex = new RegExp(from, 'g');
        const newContent = content.replace(regex, to);
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf-8');
        totalChanges++;
        console.log(`  ✓ Updated: ${path.relative(root, file)}`);
    }
}

console.log(`\nDone! Refactored ${totalChanges} files.`);

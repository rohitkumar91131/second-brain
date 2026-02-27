/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
        './app/**/*.{js,jsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                notion: {
                    bg: 'var(--notion-bg)',
                    sidebar: 'var(--notion-sidebar)',
                    hover: 'var(--notion-hover)',
                    border: 'var(--notion-border)',
                    text: 'var(--notion-text)',
                    muted: 'var(--notion-muted)',
                    accent: 'var(--notion-accent)',
                    card: 'var(--notion-card)',
                    'text-inverse': 'var(--notion-text-inverse)',
                },
            },
            animation: {
                'slide-in': 'slideIn 0.2s ease-out',
                'fade-in': 'fadeIn 0.15s ease-out',
            },
            keyframes: {
                slideIn: {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(0)' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

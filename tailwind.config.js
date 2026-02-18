/** @type {import('tailwindcss').Config} */
module.exports = {
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
                    bg: '#ffffff',
                    sidebar: '#f7f7f5',
                    hover: '#efefef',
                    border: '#e9e9e7',
                    text: '#37352f',
                    muted: '#9b9a97',
                    accent: '#2eaadc',
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

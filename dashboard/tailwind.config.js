/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    DEFAULT: '#0f172a',
                    lighter: '#1e293b',
                    lightest: '#334155',
                },
                primary: {
                    DEFAULT: '#6366f1',
                    hover: '#4f46e5',
                },
                accent: {
                    emerald: '#10b981',
                    amber: '#f59e0b',
                    rose: '#f43f5e',
                }
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gray: {
                    900: '#121212',
                    800: '#1e1e1e',
                    700: '#2d2d2d',
                    600: '#3d3d3d',
                    100: '#e0e0e0',
                },
                pink: {
                    500: '#ec4899',
                    600: '#db2777',
                }
            }
        },
    },
    plugins: [],
}


import type { Config } from "tailwindcss";

export default {
	darkMode: "class", // Set darkMode to class for Tailwind
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'royal-blue': {
					DEFAULT: '#1e3a8a',
					light: '#3b82f6',
					dark: '#1e40af',
					matte: '#1e3a8a',
					glossy: '#2563eb'
				},
				'royal-red': {
					DEFAULT: '#dc2626',
					light: '#ef4444',
					dark: '#b91c1c',
					matte: '#dc2626',
					glossy: '#f87171',
					foreground: '#ffffff',
					accent: '#fca5a5'
				},
				'cream': {
					DEFAULT: '#fef7ed',
					light: '#fffbeb',
					dark: '#fed7aa',
					warm: '#fbbf24'
				},
				'boinvit': {
					blue: '#1e3a8a',
					'blue-light': '#3b82f6',
					'blue-dark': '#1e40af',
					red: '#dc2626',
					'red-light': '#ef4444',
					'red-dark': '#b91c1c',
					cream: '#fef7ed',
					'cream-light': '#fffbeb',
					'cream-dark': '#fed7aa'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'shimmer': 'shimmer 1.5s infinite'
			},
			backgroundImage: {
				'gradient-royal': 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 50%, #fef7ed 100%)',
				'gradient-blue-glossy': 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
				'gradient-red-glossy': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
				'gradient-cream': 'linear-gradient(135deg, #fffbeb 0%, #fef7ed 100%)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

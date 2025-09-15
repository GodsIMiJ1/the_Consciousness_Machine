import type { Config } from "tailwindcss";

export default {
	darkMode: 'class',
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
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui'],
				heading: ['Montserrat', 'ui-sans-serif', 'system-ui'],
				mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
			},
			colors: {
				bg: 'hsl(var(--bg))',
				'bg-muted': 'hsl(var(--bg-muted))',
				panel: 'hsl(var(--panel))',
				text: 'hsl(var(--text))',
				'text-muted': 'hsl(var(--text-muted))',
				border: 'hsl(var(--border))',
				brand: 'hsl(var(--brand))',
				'brand-contrast': 'hsl(var(--brand-contrast))',
				accent: 'hsl(var(--accent))',
				accent2: 'hsl(var(--accent-2))',
				warn: 'hsl(var(--warn))',
				error: 'hsl(var(--error))',
				ring: 'hsl(var(--ring))',
				
				// Legacy compatibility
				background: 'hsl(var(--bg))',
				foreground: 'hsl(var(--text))',
				card: 'hsl(var(--panel))',
				'card-foreground': 'hsl(var(--text))',
				popover: 'hsl(var(--panel))',
				'popover-foreground': 'hsl(var(--text))',
				primary: 'hsl(var(--brand))',
				'primary-foreground': 'hsl(var(--brand-contrast))',
				secondary: 'hsl(var(--bg-muted))',
				'secondary-foreground': 'hsl(var(--text))',
				muted: 'hsl(var(--bg-muted))',
				'muted-foreground': 'hsl(var(--text-muted))',
				destructive: 'hsl(var(--error))',
				'destructive-foreground': 'hsl(var(--bg))',
				input: 'hsl(var(--border))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl2': '1rem'
			},
			boxShadow: {
				'aura': '0 0 0 1px var(--border), 0 10px 30px -12px rgba(0,0,0,.35)',
				'flame': 'var(--flame-shadow)',
				'flame-soft': 'var(--flame-shadow-soft)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

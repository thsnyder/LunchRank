import 'tailwindcss/tailwind.css'

declare module 'tailwindcss/tailwind-config' {
  interface UserConfig {
    daisyui?: {
      themes?: string[]
    }
  }
} 
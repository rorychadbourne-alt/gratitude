import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Varela+Round&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
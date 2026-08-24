export const metadata = {
  title: "InRead | Read the book in front of you",
  description: "Book-specific vocabulary preparation for real reading."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

'use client';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide header for checkout - it's controlled in main layout */}
      <style jsx global>{`
        header {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}

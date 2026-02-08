/**
 * Layout for /results/[id] route
 * 
 * This layout file exports route segment config to prevent static generation.
 * The page.tsx is a client component, but this server component layout
 * ensures the route is always rendered dynamically.
 */

// Force dynamic rendering - this route should never be statically generated
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المتجر',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

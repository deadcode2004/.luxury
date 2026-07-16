import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سلة المشتريات',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

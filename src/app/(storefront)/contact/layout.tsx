import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تواصل معنا',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

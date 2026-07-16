import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تفاصيل المنتج',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

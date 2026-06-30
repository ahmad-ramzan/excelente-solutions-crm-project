// Dashboard layout — wraps all role pages in the .app grid shell
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="app">{children}</div>;
}

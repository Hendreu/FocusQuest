export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 px-4 py-12">
      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            FocusQuest
          </h1>
          <p className="mt-2 text-sm text-blue-200/70">
            Aprendizado gamificado para mentes únicas
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

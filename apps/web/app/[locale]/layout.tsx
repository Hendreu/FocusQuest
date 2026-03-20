import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { AuthProvider } from "../../lib/auth/auth-provider";
import { PreferencesProvider } from "../../providers/PreferencesProvider";
import { PremiumGateProvider } from "../../features/monetization/PremiumGateProvider";
import { HeaderActions } from "../../components/HeaderActions";
import { InstallPrompt } from "../../features/pwa/InstallPrompt";
import { Sidebar } from "../../components/Sidebar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <PreferencesProvider>
          <PremiumGateProvider>
            <div style={{ display: "flex", minHeight: "100vh" }}>
              <Sidebar />
              <main style={{ flex: 1, overflow: "auto" }}>
                <HeaderActions />
                {children}
                <InstallPrompt />
              </main>
            </div>
          </PremiumGateProvider>
        </PreferencesProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}

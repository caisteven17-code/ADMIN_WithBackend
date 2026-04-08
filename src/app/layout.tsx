import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import styles from "./layout.module.css";
import RootLayoutClient from "@/components/layout/RootLayoutClient";

export const metadata = {
  title: "HopeCard Admin",
  description: "Admin portal for HopeCard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootLayoutClient>
          <Sidebar />

          <div className={styles.rightColumn}>
            <Header />
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </RootLayoutClient>
      </body>
    </html>
  );
}

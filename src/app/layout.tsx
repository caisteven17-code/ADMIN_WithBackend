import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import styles from "./layout.module.css"; // Import the new styles!

export const metadata = {
  title: "HopeCard Admin",
  description: "Admin portal for HopeCard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className={styles.appWrapper}>
          
          <Sidebar />
          
          <div className={styles.rightColumn}>
            <Header />
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
          
        </div>
      </body>
    </html>
  );
}
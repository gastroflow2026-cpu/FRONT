"use client";

import { useState } from "react";
import { Employees } from "@/components/adminDashboard/Employees/Employees";
import { Menu } from "@/components/adminDashboard/Menu/Menu";
import { Metrics } from "@/components/adminDashboard/Metrics/Metrics";
import { Orders } from "@/components/adminDashboard/Orders/Orders";
import { Reservations } from "@/components/adminDashboard/Reservations/Reservations";
import { Settings } from "@/components/adminDashboard/Settings/Settings";
import { Sidebar } from "@/components/adminDashboard/Sidebar/Sidebar";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import styles from "./Admin.module.css";

export default function Admin() {
  const [activeModule, setActiveModule] = useState("employees");

  const modules: Record<string, React.ReactNode> = {
    employees: <Employees />,
    reservations: <Reservations />,
    menu: <Menu />,
    metrics: <Metrics />,
    orders: <Orders />,
    settings: <Settings />,
  };

  return (
    <div className={styles.rootContainer}>
      <Navbar />

      <div className={styles.middleSection}>
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

        <main className={styles.mainContent}>
          <div className={styles.container}>
            {modules[activeModule] || <Employees />}
          </div>
        </main>
      </div>

      <footer className={styles.footerWrapper}>
        <Footer />
      </footer>
    </div>
  );
}

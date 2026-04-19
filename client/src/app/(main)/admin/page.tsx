"use client"

import { Employees } from "@/components/adminDashboard/Employees/Employees";
import { Menu } from "@/components/adminDashboard/Menu/Menu";
import { Metrics } from "@/components/adminDashboard/Metrics/Metrics";
import { Orders } from "@/components/adminDashboard/Orders/Orders";
import { Reservations } from "@/components/adminDashboard/Reservations/Reservations";
import { Sidebar } from "@/components/adminDashboard/Sidebar/Sidebar";
import { useState } from "react";

export default function Admin() {
    const [activeModule, setActiveModule] = useState("employees")

  const renderModule = () => {
    switch (activeModule) {
      case "employees":
        return <Employees />;
      case "reservations":
        return <Reservations />;
      case "menu":
        return <Menu />;
      case "metrics":
        return <Metrics />;
      case "orders":
        return <Orders />;
      default:
        return <Employees />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
          {renderModule()}
        </div>
      </main>
    </div>
  );
}
"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Navbar from "@/components/layout/AdminNavbar";

export default function DashboardLayout({ children }) {
  return (
    <DndProvider backend={HTML5Backend}>
      <Navbar />
      {children}
    </DndProvider>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { MenuItem } from "./MenuItem";
import styles from "@/styles/DashboardSidebar.module.scss";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    id: 1,
    icon: "/dashboard.png",
    label: "Dashboard",
    goto: "/administrative/dashboard",
  },
];

const hrItems = [
  {
    id: 1,
    icon: "/plantilla.png",
    label: "Plantilla",
    goto: "/administrative/plantilla",
  },
];

const tkItems = [
  {
    id: 1,
    icon: "/time_shift.png",
    label: "Time Shift",
    goto: "/administrative/time-shift",
  },
  {
    id: 2,
    icon: "/premiumpay-multiplier.png",
    label: "Premium Pay/Multiplier",
    goto: "/administrative/premiumpaymultiplier",
  },
];

const otherItems = [
  {
    id: 1,
    icon: "/accounts.png",
    label: "Accounts",
    goto: "/administrative/accounts",
  },
  {
    id: 2,
    icon: "/help.png",
    label: "Help",
    goto: "/administrative",
  },
];

export default function Sidebar() {
  const pathname = usePathname() || "";
  const [hrOpen, setHrOpen] = useState(false);
  const [tkOpen, setTkOpen] = useState(false);

  // 👇 Auto-open HR section if current route matches
  useEffect(() => {
    if (hrItems.some((item) => pathname.startsWith(item.goto))) {
      setHrOpen(true);
    }
    if (tkItems.some((item) => pathname.startsWith(item.goto))) {
      setTkOpen(true);
    }
  }, [pathname]);

  return (
    <nav
      className={styles.Sidebar}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>AUI</div>
        <div className={styles.brandName}>Administrative UI</div>
      </div>

      {/* Human Resource (collapsible) */}
      <div className={styles.menuSection}>
        <div role="menu">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              goto={item.goto}
              isActive={pathname === item.goto}
              onClick={() => {}}
            />
          ))}
        </div>
        <h2
          className={styles.menuHeader}
          onClick={() => setHrOpen(!hrOpen)}
          style={{ cursor: "pointer" }}
        >
          HUMAN RESOURCE {hrOpen ? "▲" : "▼"}
        </h2>
        {hrOpen && (
          <div role="menu">
            {hrItems.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                goto={item.goto}
                isActive={pathname === item.goto}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Time Keeping (collapsible) */}
      <div className={styles.menuSection}>
        <h2
          className={styles.menuHeader}
          onClick={() => setTkOpen(!tkOpen)}
          style={{ cursor: "pointer" }}
        >
          TIME KEEPING {tkOpen ? "▲" : "▼"}
        </h2>
        {tkOpen && (
          <div role="menu">
            {tkItems.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                goto={item.goto}
                isActive={pathname === item.goto}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* UTILITIES */}
      <div className={styles.menuSection}>
        <h2 className={styles.menuHeader}>UTILITIES</h2>
        <div role="menu">
          {otherItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              goto={item.goto}
              isActive={pathname === item.goto}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

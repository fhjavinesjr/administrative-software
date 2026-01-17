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
  {
    id: 2,
    icon: "/jobposition.png",
    label: "Job Position",
    goto: "/administrative/job-position",
  },
  {
    id: 3,
    icon: "/appointment.png",
    label: "Nature Of Appointment",
    goto: "/administrative/natureofappointment",
  },
  {
    id: 4,
    icon: "/separation.png",
    label: "Nature Of Separation",
    goto: "/administrative/natureofseparation",
  },
  {
    id: 5,
    icon: "/engagement.png",
    label: "Official Engagement",
    goto: "/administrative/officialengagement",
  },
  {
    id: 6,
    icon: "/leave.png",
    label: "Leave Types",
    goto: "/administrative/leavetypes",
  },
  {
    id: 7,
    icon: "/genders.png",
    label: "Gender",
    goto: "/administrative/gender",
  },
  {
    id: 8,
    icon: "/status.png",
    label: "Civil Status",
    goto: "/administrative/civilstatus",
  },
];

const userManagementItem = [
  {
    id: 1,
    icon: "/usersetting.png",
    label: "User Setting",
    goto: "/administrative/usersetting",
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

const payrollItems = [
  {
    id: 1,
    icon: "/salaryschedule.png",
    label: "Salary Schedule",
    goto: "/administrative/salaryschedule",
  },
  {
    id: 2,
    icon: "/earningtable.png",
    label: "Earning Leave Table",
    goto: "/administrative/earningleave",
  },
  {
    id: 3,
    icon: "/daytable.png",
    label: "Day Equivalent Table",
    goto: "/administrative/dayequivalent",
  },
  {
    id: 4,
    icon: "/hazard.png",
    label: "Hazard Pay Table",
    goto: "/administrative/hazard",
  },
  {
    id: 5,
    icon: "/table.png",
    label: "GSIS Contribution Table",
    goto: "/administrative/gsis",
  },
  {
    id: 6,
    icon: "/health.png",
    label: "PhilHealth Contribution Table",
    goto: "/administrative/philHealth",
  },
    {
    id: 7,
    icon: "/tax.png",
    label: "With-Holding Tax Table",
    goto: "/administrative/tax",
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
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // 👇 Auto-open HR section if current route matches
  useEffect(() => {
    if (hrItems.some((item) => pathname.startsWith(item.goto))) {
      setHrOpen(true);
    }
    if (tkItems.some((item) => pathname.startsWith(item.goto))) {
      setTkOpen(true);
    }
    if (payrollItems.some((item) => pathname.startsWith(item.goto))) {
      setPayrollOpen(true);
    }
    if (userManagementItem.some((item) => pathname.startsWith(item.goto))) {
      setUserOpen(true);
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

      {/* Payroll (collapsible) */}
      <div className={styles.menuSection}>
        <h2
          className={styles.menuHeader}
          onClick={() => setPayrollOpen(!payrollOpen)}
          style={{ cursor: "pointer" }}
        >
          PAYROLL {payrollOpen ? "▲" : "▼"}
        </h2>
        {payrollOpen && (
          <div role="menu">
            {payrollItems.map((item) => (
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

      {/* USER MANAGEMENT */}
      <div className={styles.menuSection}>
        <h2
          className={styles.menuHeader}
          onClick={() => setUserOpen(!userOpen)}
          style={{ cursor: "pointer" }}
        >
          USER MANAGEMENT {userOpen ? "▲" : "▼"}
        </h2>
        {userOpen && (
          <div role="menu">
            {userManagementItem.map((item) => (
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

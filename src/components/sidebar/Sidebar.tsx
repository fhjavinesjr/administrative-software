"use client";

import React, { useState, useEffect } from "react";
import { MenuItem } from "./MenuItem";
import styles from "@/styles/DashboardSidebar.module.scss";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { authLogout } from "@/lib/utils/authLogout";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";

type MenuChild = {
  id: number;
  icon: string;
  label: string;
  goto: string;
  permKey: string;
};

type MenuItemType = {
  id: number;
  icon: string;
  label: string;
  goto: string;
  children?: MenuChild[];
  permKey?: string; // Optional permission key for access control
};

const menuItems: MenuItemType[] = [];

const systemSetupItems = [
  {
    id: 1,
    icon: "/gear.png",
    label: "Settings",
    goto: "/administrative/systemsetup",
    permKey: "admin.settings",
  },
  {
    id: 2,
    icon: "/gear.png",
    label: "Technical Settings",
    goto: "/administrative/system-config",
    permKey: "admin.technicalSettings",
  },
];

const hrItems: MenuItemType[] = [
  {
    id: 1,
    icon: "/announcement.svg",
    label: "Announcement",
    goto: "/administrative/announcement",
    permKey: "admin.announcement",
  },
  {
    id: 2,
    icon: "/daytable.png",
    label: "Holiday Calendar",
    goto: "/administrative/holiday",
    permKey: "admin.holiday",
  },
  {
    id: 3,
    icon: "/jobposition.png",
    label: "Job Position",
    goto: "/administrative/job-position",
    permKey: "admin.jobPosition",
  },
  {
    id: 4,
    icon: "/plantilla.png",
    label: "Plantilla",
    goto: "/administrative/plantilla",
    permKey: "admin.plantilla",
  },
  {
    id: 5,
    icon: "/appointment.png",
    label: "Nature Of Appointment",
    goto: "/administrative/natureofappointment",
    permKey: "admin.natureAppointment",
  },
  {
    id: 6,
    icon: "/separation.png",
    label: "Nature Of Separation",
    goto: "/administrative/natureofseparation",
    permKey: "admin.natureSeparation",
  },
  {
    id: 7,
    icon: "/engagement.png",
    label: "Official Engagement",
    goto: "/administrative/officialengagement",
    permKey: "admin.officialEngagement",
  },
  {
    id: 8,
    icon: "/leave.png",
    label: "Leave Types",
    goto: "/administrative/leavetypes",
    permKey: "admin.leave",
  },
  {
    id: 9,
    icon: "/genders.png",
    label: "Gender",
    goto: "/administrative/gender",
    permKey: "admin.gender",
  },
  {
    id: 10,
    icon: "/status.png",
    label: "Civil Status",
    goto: "/administrative/civilstatus",
    permKey: "admin.civilStatus",
  },
  {
    id: 11,
    icon: "/work.png",
    label: "Workforce Structure Management",
    goto: "",
    children: [
      {
        id: 1,
        icon: "/areas.png",
        label: "Areas",
        goto: "/administrative/areas",
        permKey: "admin.areas",
      },
      {
        id: 2,
        icon: "/business.png",
        label: "Business Units",
        goto: "/administrative/businessunits",
        permKey: "admin.businessUnits",
      },
      {
        id: 3,
        icon: "/manage.png",
        label: "Manage Personnel",
        goto: "/administrative/managepersonnel",
        permKey: "admin.managePersonnel",
      },
      {
        id: 4,
        icon: "/request.png",
        label: "Employee Requests",
        goto: "/administrative/employeerequest",
        permKey: "admin.employeeRequest",
      },
      {
        id: 5,
        icon: "/approval.png",
        label: "Approval Workflow",
        goto: "/administrative/approvalworkflow",
        permKey: "admin.approvalWorkflow",
      },
    ],
  },
];

const userManagementItem = [
  {
    id: 1,
    icon: "/usersetting.png",
    label: "User Setting",
    goto: "/administrative/usersetting",
    permKey: "admin.userSetting",
  },
  {
    id: 2,
    icon: "/gear.png",
    label: "Permission",
    goto: "/administrative/permission",
    permKey: "admin.permission",
  },
];

const tkItems = [
  {
    id: 1,
    icon: "/time_shift.png",
    label: "Time Shift",
    goto: "/administrative/time-shift",
    permKey: "admin.timeShift",
  },
];

const payrollItems = [
  {
    id: 1,
    icon: "/salaryschedule.png",
    label: "Salary Schedule",
    goto: "/administrative/salaryschedule",
    permKey: "admin.salarySchedule",
  },
  {
    id: 2,
    icon: "/salary.png",
    label: "Salary Period Setting",
    goto: "/administrative/salary",
    permKey: "admin.salaryPeriod",
  },
  {
    id: 3,
    icon: "/earningtable.png",
    label: "Earning Leave Table",
    goto: "/administrative/earningleave",
    permKey: "admin.earningleave",
  },
  {
    id: 4,
    icon: "/daytable.png",
    label: "Day Equivalent Table",
    goto: "/administrative/dayequivalent",
    permKey: "admin.dayEquivalent",
  },
  {
    id: 5,
    icon: "/hazard.png",
    label: "Hazard Pay Table",
    goto: "/administrative/hazard",
    permKey: "admin.hazardPay",
  },
  {
    id: 6,
    icon: "/table.png",
    label: "GSIS Contribution Table",
    goto: "/administrative/gsis",
    permKey: "admin.gsis",
  },
  {
    id: 7,
    icon: "/health.png",
    label: "PhilHealth Contribution Table",
    goto: "/administrative/philHealth",
    permKey: "admin.philhealth",
  },
  {
    id: 8,
    icon: "/tax.png",
    label: "With-Holding Tax Table",
    goto: "/administrative/tax",
    permKey: "admin.tax",
  },
  {
    id: 9,
    icon: "/Earnings.png",
    label: "Earning Types",
    goto: "/administrative/Earning-Types",
    permKey: "admin.earningTypes",
  },
  {
    id: 10,
    icon: "/Deductions.png",
    label: "Deduction Types",
    goto: "/administrative/Deduction-Types",
    permKey: "admin.deductionTypes",
  },
  {
    id: 11,
    icon: "/pagibig.png",
    label: "Pag-IBIG Contribution Table",
    goto: "/administrative/pagibig",
    permKey: "admin.pagibig",
  },
  {
    id: 12,
    icon: "/gear.png",
    label: "Payroll Settings",
    goto: "/administrative/payrollsettings",
    permKey: "admin.payrollSettings",
  },
];

const otherItems = [
  {
    id: 1,
    icon: "/help.png",
    label: "Help",
    goto: "/administrative",
  },
  {
    id: 2,
    icon: "/logout.png",
    label: "Logout",
    action: "logout",
  },
];

export default function Sidebar() {
  const pathname = usePathname() || "";
  const [hrOpen, setHrOpen] = useState(false);
  const [tkOpen, setTkOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const router = useRouter();

  const filterAccessibleItems = (items: MenuItemType[]): MenuItemType[] =>
    items.reduce<MenuItemType[]>((visible, item) => {
      if (item.children) {
        const children = item.children.filter((child) =>
          localStorageUtil.canAccess(child.permKey),
        );
        if (children.length > 0) visible.push({ ...item, children });
        return visible;
      }

      if (item.permKey && localStorageUtil.canAccess(item.permKey))
        visible.push(item);
      return visible;
    }, []);

  const visibleSystemSetupItems = filterAccessibleItems(systemSetupItems);
  const visibleHrItems = filterAccessibleItems(hrItems);
  const visibleTkItems = filterAccessibleItems(tkItems);
  const visiblePayrollItems = filterAccessibleItems(payrollItems);
  const visibleUserManagementItems = filterAccessibleItems(userManagementItem);

  // 👇 Auto-open HR section if current route matches
  useEffect(() => {
    if (
      visibleHrItems.some(
        (item) =>
          (item.goto && pathname.startsWith(item.goto)) ||
          item.children?.some((child) => pathname.startsWith(child.goto)),
      )
    ) {
      setHrOpen(true);
    }
    if (visibleTkItems.some((item) => pathname.startsWith(item.goto))) {
      setTkOpen(true);
    }
    if (visiblePayrollItems.some((item) => pathname.startsWith(item.goto))) {
      setPayrollOpen(true);
    }
    if (
      visibleUserManagementItems.some((item) => pathname.startsWith(item.goto))
    ) {
      setUserOpen(true);
    }
  }, [pathname]);

  const isChildActive = (item: MenuItemType) =>
    item.children?.some((child) => pathname.startsWith(child.goto));

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

        {/* SYSTEM SETUP */}
        {visibleSystemSetupItems.length > 0 && (
          <div className={styles.menuSection}>
            <h2 className={styles.menuHeader}>SYSTEM SETUP</h2>
            <div role="menu">
              {visibleSystemSetupItems.map((item) => (
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
        )}

        {visibleHrItems.length > 0 && (
          <>
            <h2
              className={styles.menuHeader}
              onClick={() => setHrOpen(!hrOpen)}
              style={{ cursor: "pointer" }}
            >
              HUMAN RESOURCE {hrOpen ? "▲" : "▼"}
            </h2>

            {hrOpen && (
              <div role="menu">
                {/* {hrItems.map((item) => (
              <MenuItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                goto={item.goto}
                isActive={pathname === item.goto}
                onClick={() => {}}
              />

            ))} */}
                {visibleHrItems.map((item) => {
                  const childActive = isChildActive(item);

                  return (
                    <div
                      key={item.id}
                      className={`${styles.menuItemWrapper} ${
                        childActive ? styles.open : ""
                      }`}
                    >
                      <MenuItem
                        icon={item.icon}
                        label={item.label}
                        goto={item.goto}
                        isActive={pathname === item.goto || childActive}
                        onClick={() => {}}
                      />

                      {item.children && (
                        <div className={styles.subMenu}>
                          {item.children.map((child) => (
                            <MenuItem
                              key={child.id}
                              icon={child.icon}
                              label={child.label}
                              goto={child.goto}
                              isActive={pathname === child.goto}
                              onClick={() => {}}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Time Keeping (collapsible) */}
      {visibleTkItems.length > 0 && (
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
              {visibleTkItems.map((item) => (
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
      )}

      {/* Payroll (collapsible) */}
      {visiblePayrollItems.length > 0 && (
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
              {visiblePayrollItems.map((item) => (
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
      )}

      {/* USER MANAGEMENT */}
      {visibleUserManagementItems.length > 0 && (
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
              {visibleUserManagementItems.map((item) => (
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
      )}

      {/* UTILITIES */}
      <div className={styles.menuSection}>
        <h2 className={styles.menuHeader}>UTILITIES</h2>
        <div role="menu">
          {otherItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={item.goto ? pathname === item.goto : false}
              onClick={() => {
                if (item.action === "logout") {
                  authLogout();
                  router.replace("/administrative/login");
                } else if (item.goto) {
                  router.push(item.goto);
                }
              }}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

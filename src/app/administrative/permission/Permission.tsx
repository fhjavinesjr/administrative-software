"use client";

import { localStorageUtil } from "@/lib/utils/localStorageUtil";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useEffect, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Permission.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = runtimeConfig.getApiUrl("administrative");

// ---------------------------------------------------------------------------
// Module definition — only modules that exist in the new HRIS.
// type:
//   "app-header" → bold app section divider, no checkboxes
//   "group"      → Access checkbox only (section grouping)
//   "module"     → Access + optional Add/Edit/Delete
// ---------------------------------------------------------------------------
type ModuleEntry = {
  key: string;
  label: string;
  type: "app-header" | "group" | "module";
  indent: number;
  hasAdd?: boolean;
  hasEdit?: boolean;
  hasDelete?: boolean;
};

const MODULE_LIST: ModuleEntry[] = [
  // ── ADMINISTRATIVE ────────────────────────────────────────────────────
  { key: "app.admin", label: "Administrative", type: "app-header", indent: 0 },
  {
    key: "grp.admin.systemSetup",
    label: "System Setup",
    type: "group",
    indent: 0,
  },
  {
    key: "admin.settings",
    label: "Settings",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.technicalSettings",
    label: "Technical Settings",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  { key: "grp.admin.hr", label: "Human Resource", type: "group", indent: 0 },
  {
    key: "admin.announcement",
    label: "Announcement",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.holiday",
    label: "Holiday Calendar",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.jobPosition",
    label: "Job Position",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.plantilla",
    label: "Plantilla",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.natureAppointment",
    label: "Nature Of Appointment",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.natureSeparation",
    label: "Nature Of Separation",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.officialEngagement",
    label: "Official Engagement",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.leave",
    label: "Leave",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.gender",
    label: "Gender",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.civilStatus",
    label: "Civil Status",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "grp.admin.workforce",
    label: "Workforce Structure Management",
    type: "group",
    indent: 1,
  },
  {
    key: "admin.areas",
    label: "Areas",
    type: "module",
    indent: 2,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.businessUnits",
    label: "Business Units",
    type: "module",
    indent: 2,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.managePersonnel",
    label: "Manage Personnel",
    type: "module",
    indent: 2,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.employeeRequest",
    label: "Employee Requests",
    type: "module",
    indent: 2,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.approvalWorkflow",
    label: "Approval Workflow",
    type: "module",
    indent: 2,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  { key: "grp.admin.tk", label: "Time Keeping", type: "group", indent: 0 },
  {
    key: "admin.timeShift",
    label: "Time Shift",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  { key: "grp.admin.payroll", label: "Payroll", type: "group", indent: 0 },
  {
    key: "admin.salarySchedule",
    label: "Salary Schedule",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.salaryPeriod",
    label: "Salary Period Setting",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.earningleave",
    label: "Earning Leave Table",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.dayEquivalent",
    label: "Day Equivalent Table",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.hazardPay",
    label: "Hazard Pay Table",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.gsis",
    label: "GSIS Contribution Table",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.philhealth",
    label: "PhilHealth Contribution Table",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.tax",
    label: "With-Holding Tax Table",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.earningTypes",
    label: "Earning Types",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.deductionTypes",
    label: "Deduction Types",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.pagibig",
    label: "Pag-IBIG Contribution Table",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.payrollSettings",
    label: "Payroll Settings",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "grp.admin.userMgmt",
    label: "User Management",
    type: "group",
    indent: 0,
  },
  {
    key: "admin.userSetting",
    label: "User Setting",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "admin.permission",
    label: "Permission",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },

  // ── HR MANAGEMENT ─────────────────────────────────────────────────────
  { key: "app.hrm", label: "HR Management", type: "app-header", indent: 0 },
  {
    key: "hrm.employmentRecord",
    label: "Employment Record",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.leaveInformation",
    label: "Leave Information",
    type: "module",
    indent: 0,
  },
  {
    key: "hrm.plantillaMonitoring",
    label: "Plantilla Monitoring",
    type: "module",
    indent: 0,
  },
  {
    key: "grp.hrm.selfService",
    label: "HR Self Service",
    type: "group",
    indent: 0,
  },
  {
    key: "hrm.ss.beginBalance",
    label: "Beginning Balance",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.ss.leaveApp",
    label: "Leave Application",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.ss.overtimeReq",
    label: "Overtime Request",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.ss.coc",
    label: "Compensatory Overtime Credit",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.ss.cto",
    label: "Compensatory Time Off",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.ss.officialEngag",
    label: "Official Engagement",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.ss.passSlip",
    label: "Pass Slip",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "hrm.ss.timeCorrection",
    label: "Time Correction",
    type: "module",
    indent: 1,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },

  // ── TIME KEEPING ─────────────────────────────────────────────────────
  { key: "app.tk", label: "Time Keeping", type: "app-header", indent: 0 },
  {
    key: "tk.dtr",
    label: "Daily Time Record",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "tk.workSchedule",
    label: "Work Schedule",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },

  // ── PAYROLL ──────────────────────────────────────────────────────────
  { key: "app.payroll", label: "Payroll", type: "app-header", indent: 0 },
  {
    key: "payroll.beginBalance",
    label: "Beginning Balance",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "payroll.earningAllowance",
    label: "Earnings and Allowance",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "payroll.deduction",
    label: "Deduction",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "payroll.loan",
    label: "Loan",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "payroll.computation",
    label: "Payroll Computation",
    type: "module",
    indent: 0,
  },
  {
    key: "payroll.register",
    label: "Payroll Register",
    type: "module",
    indent: 0,
  },
  {
    key: "payroll.payslip",
    label: "Payslip",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "payroll.reports.earnings",
    label: "Reports - Earnings",
    type: "module",
    indent: 0,
  },
  {
    key: "payroll.reports.deductions",
    label: "Reports - Deductions",
    type: "module",
    indent: 0,
  },
  {
    key: "payroll.reports.remittances",
    label: "Reports - Remittances",
    type: "module",
    indent: 0,
  },

  // ── EMPLOYEE PORTAL ──────────────────────────────────────────────────
  {
    key: "app.empPortal",
    label: "Employee Portal",
    type: "app-header",
    indent: 0,
  },
  { key: "ep.dashboard", label: "Dashboard", type: "module", indent: 0 },
  {
    key: "ep.leaveApp",
    label: "Leave Application",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "ep.overtimeReq",
    label: "Overtime Request",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "ep.coc",
    label: "Compensatory Overtime Credit",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "ep.cto",
    label: "Compensatory Time Off",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "ep.officialEngag",
    label: "Official Engagement",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "ep.passSlip",
    label: "Pass Slip",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
  {
    key: "ep.timeCorrection",
    label: "Time Correction",
    type: "module",
    indent: 0,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PermEntry = {
  canAccess: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
};
type PermMap = Record<string, PermEntry>;

type PortalModuleKey =
  | "administrative"
  | "hrManagement"
  | "timeKeeping"
  | "payroll";
type PortalModuleAccess = Record<PortalModuleKey, boolean>;

type RulesetRow = {
  permissionId: number;
  permissionName: string;
  isAdministrator: boolean;
  permissionData: string;
  portalModuleAccess?: string | null;
};

const EMPTY_ENTRY: PermEntry = {
  canAccess: false,
  canAdd: false,
  canEdit: false,
  canDelete: false,
};

const EMPTY_PORTAL_MODULE_ACCESS: PortalModuleAccess = {
  administrative: false,
  hrManagement: false,
  timeKeeping: false,
  payroll: false,
};

const PORTAL_MODULE_BY_APP_KEY: Partial<Record<string, PortalModuleKey>> = {
  "app.admin": "administrative",
  "app.hrm": "hrManagement",
  "app.tk": "timeKeeping",
  "app.payroll": "payroll",
};

function buildEmptyMap(): PermMap {
  const map: PermMap = {};
  MODULE_LIST.forEach((m) => {
    if (m.type !== "app-header") map[m.key] = { ...EMPTY_ENTRY };
  });
  return map;
}

function parsePermissionData(json: string | null | undefined): PermMap {
  if (!json) return buildEmptyMap();
  try {
    const parsed = JSON.parse(json) as PermMap;
    return { ...buildEmptyMap(), ...parsed };
  } catch {
    return buildEmptyMap();
  }
}

function parsePortalModuleAccess(
  json: string | null | undefined,
): PortalModuleAccess {
  if (!json) return { ...EMPTY_PORTAL_MODULE_ACCESS };
  try {
    const parsed = JSON.parse(json) as Partial<PortalModuleAccess>;
    return {
      administrative: parsed.administrative === true,
      hrManagement: parsed.hrManagement === true,
      timeKeeping: parsed.timeKeeping === true,
      payroll: parsed.payroll === true,
    };
  } catch {
    return { ...EMPTY_PORTAL_MODULE_ACCESS };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Permission() {
  const canAdd = localStorageUtil.canAdd("admin.permission");
  const canEdit = localStorageUtil.canEdit("admin.permission");
  const canDelete = localStorageUtil.canDelete("admin.permission");
  const [permName, setPermName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [permMap, setPermMap] = useState<PermMap>(buildEmptyMap());
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [rulesets, setRulesets] = useState<RulesetRow[]>([]);
  const [portalModuleAccess, setPortalModuleAccess] =
    useState<PortalModuleAccess>({ ...EMPTY_PORTAL_MODULE_ACCESS });

  const toast = (icon: "success" | "error", title: string) =>
    Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    }).fire({ icon, title });

  const loadRulesets = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/api/permission/get-all`);
      if (!res.ok) throw new Error();
      setRulesets(await res.json());
    } catch {
      toast("error", "Failed to load permission rulesets");
    }
  }, []);

  useEffect(() => {
    loadRulesets();
  }, [loadRulesets]);

  const handleClear = () => {
    setPermName("");
    setIsAdmin(false);
    setPermMap(buildEmptyMap());
    setPortalModuleAccess({ ...EMPTY_PORTAL_MODULE_ACCESS });
    setIsEditing(false);
    setEditId(null);
  };

  const toggle = (key: string, field: keyof PermEntry) => {
    setPermMap((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: !prev[key][field] },
    }));
  };

  const togglePortalModule = (key: PortalModuleKey) => {
    setPortalModuleAccess((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAdminToggle = (checked: boolean) => {
    setIsAdmin(checked);
    if (checked) {
      const all: PermMap = {};
      MODULE_LIST.forEach((m) => {
        if (m.type !== "app-header") {
          all[m.key] = {
            canAccess: true,
            canAdd: !!m.hasAdd,
            canEdit: !!m.hasEdit,
            canDelete: !!m.hasDelete,
          };
        }
      });
      setPermMap(all);
      setPortalModuleAccess({
        administrative: true,
        hrManagement: true,
        timeKeeping: true,
        payroll: true,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    /* RBAC:handleSave */

    if (isEditing ? !canEdit : !canAdd) {
      e.preventDefault();

      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: isEditing
          ? "You do not have permission to edit this ruleset."
          : "You do not have permission to add a ruleset.",
      });

      return;
    }
    e.preventDefault();
    if (!permName.trim()) {
      Swal.fire({ icon: "warning", text: "Permission Name is required." });
      return;
    }
    const payload = {
      permissionName: permName.trim(),
      isAdministrator: isAdmin,
      permissionData: JSON.stringify(permMap),
      portalModuleAccess: JSON.stringify(portalModuleAccess),
    };
    try {
      if (!isEditing) {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/permission/create`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? "Failed");
        }
        toast("success", "Permission ruleset saved!");
      } else {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/permission/update/${editId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? "Failed");
        }
        toast("success", "Permission ruleset updated!");
      }
      handleClear();
      loadRulesets();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleEdit = (row: RulesetRow) => {
    /* RBAC:handleEdit */

    if (!canEdit) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to edit this record.",
      });

      return;
    }
    setEditId(row.permissionId);
    setPermName(row.permissionName);
    setIsAdmin(row.isAdministrator);
    setPermMap(parsePermissionData(row.permissionData));
    setPortalModuleAccess(parsePortalModuleAccess(row.portalModuleAccess));
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (row: RulesetRow) => {
    /* RBAC:handleDelete */

    if (!canDelete) {
      void Swal.fire({
        icon: "warning",
        title: "Permission denied",
        text: "You do not have permission to delete this record.",
      });

      return;
    }
    Swal.fire({
      text: `Delete permission ruleset "${row.permissionName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await fetchWithAuth(
          `${API_BASE_URL}/api/permission/delete/${row.permissionId}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error();
        toast("success", "Deleted!");
        loadRulesets();
      } catch {
        toast("error", "Delete failed");
      }
    });
  };

  const getIndentStyle = (indent: number) => ({
    paddingLeft: `${indent * 20}px`,
  });

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Permission</h2>
        </div>
        <div className={modalStyles.modalBody}>
          {/* System note about the reserved USER ruleset */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              background: "#fffbeb",
              border: "1px solid #f59e0b",
              borderLeft: "4px solid #f59e0b",
              borderRadius: "6px",
              padding: "12px 16px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#78350f",
              lineHeight: "1.5",
            }}
          >
            <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
            <div>
              <strong>Reserved Ruleset Name — &quot;USER&quot;</strong>
              <br />
              The permission ruleset named exactly <strong>USER</strong> is{" "}
              <strong>mandatory and must always exist</strong>. It identifies
              common employees in the system — when a staff member logs in with
              the <strong>USER</strong> ruleset, the Employee Name field is
              automatically filled with their own name and locked to prevent
              editing. Do <strong>not</strong> rename or delete this ruleset.
            </div>
          </div>

          <form className={styles.PermissionForm} onSubmit={handleSave}>
            <div className={styles.formRow}>
              <label>Permission Name</label>
              <input
                type="text"
                value={permName}
                onChange={(e) => setPermName(e.target.value)}
                placeholder="e.g. HR Admin, Payroll Clerk"
                required
              />
              {permName.trim().toUpperCase() === "USER" && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#92400e",
                    background: "#fef3c7",
                    border: "1px solid #fcd34d",
                    borderRadius: "4px",
                    padding: "2px 8px",
                  }}
                >
                  ⚠️ This is the reserved <strong>USER</strong> ruleset —
                  required by the system to identify common employees.
                </span>
              )}
            </div>
            <div className={styles.formRowInline}>
              <label>Administrator</label>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => handleAdminToggle(e.target.checked)}
              />
            </div>

            <div className={styles.moduleTableWrapper}>
              <table className={styles.moduleTable}>
                <thead>
                  <tr>
                    <th className={styles.modulesCol}>MODULES</th>
                    <th className={styles.crudCol}>Access</th>
                    <th className={styles.crudCol}>Add</th>
                    <th className={styles.crudCol}>Edit</th>
                    <th className={styles.crudCol}>Delete</th>
                    <th className={styles.crudCol}>Portal</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULE_LIST.map((m) => {
                    if (m.type === "app-header") {
                      const portalModuleKey = PORTAL_MODULE_BY_APP_KEY[m.key];
                      if (portalModuleKey) {
                        return (
                          <tr key={m.key} className={styles.appHeader}>
                            <td style={getIndentStyle(m.indent)}>
                              <strong>{m.label}</strong>
                            </td>
                            <td />
                            <td />
                            <td />
                            <td />
                            <td className={styles.cbCell}>
                              <input
                                type="checkbox"
                                checked={portalModuleAccess[portalModuleKey]}
                                onChange={() =>
                                  togglePortalModule(portalModuleKey)
                                }
                                aria-label={`Show ${m.label} in Employee Portal`}
                                title={`Show ${m.label} in Employee Portal`}
                              />
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={m.key} className={styles.appHeader}>
                          <td colSpan={6} style={getIndentStyle(m.indent)}>
                            <strong>{m.label}</strong>
                          </td>
                        </tr>
                      );
                    }
                    if (m.type === "group") {
                      return (
                        <tr key={m.key} className={styles.groupRow}>
                          <td style={getIndentStyle(m.indent)}>
                            <strong>{m.label}</strong>
                          </td>
                          <td className={styles.cbCell}>
                            <input
                              type="checkbox"
                              checked={permMap[m.key]?.canAccess ?? false}
                              onChange={() => toggle(m.key, "canAccess")}
                            />
                          </td>
                          <td />
                          <td />
                          <td />
                          <td />
                        </tr>
                      );
                    }
                    const entry = permMap[m.key] ?? EMPTY_ENTRY;
                    return (
                      <tr key={m.key} className={styles.moduleRow}>
                        <td style={getIndentStyle(m.indent)}>{m.label}</td>
                        <td className={styles.cbCell}>
                          <input
                            type="checkbox"
                            checked={entry.canAccess}
                            onChange={() => toggle(m.key, "canAccess")}
                          />
                        </td>
                        <td className={styles.cbCell}>
                          {m.hasAdd ? (
                            <input
                              type="checkbox"
                              checked={entry.canAdd}
                              onChange={() => toggle(m.key, "canAdd")}
                            />
                          ) : null}
                        </td>
                        <td className={styles.cbCell}>
                          {m.hasEdit ? (
                            <input
                              type="checkbox"
                              checked={entry.canEdit}
                              onChange={() => toggle(m.key, "canEdit")}
                            />
                          ) : null}
                        </td>
                        <td className={styles.cbCell}>
                          {m.hasDelete ? (
                            <input
                              type="checkbox"
                              checked={entry.canDelete}
                              onChange={() => toggle(m.key, "canDelete")}
                            />
                          ) : null}
                        </td>
                        <td />
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={isEditing ? styles.updateButton : styles.saveButton}
                disabled={isEditing ? !canEdit : !canAdd}
              >
                {isEditing ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClear}
              >
                Cancel
              </button>
            </div>
          </form>

          {rulesets.length > 0 && (
            <div className={styles.RulesetTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Permission Name</th>
                    <th>Administrator</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rulesets.map((row) => (
                    <tr key={row.permissionId}>
                      <td>
                        {row.permissionName}
                        {row.permissionName.toUpperCase() === "USER" && (
                          <span
                            style={{
                              marginLeft: "8px",
                              fontSize: "11px",
                              background: "#fef3c7",
                              color: "#92400e",
                              border: "1px solid #fcd34d",
                              borderRadius: "4px",
                              padding: "1px 6px",
                              fontWeight: 600,
                              verticalAlign: "middle",
                            }}
                          >
                            Reserved
                          </span>
                        )}
                      </td>
                      <td>{row.isAdministrator ? "✔ Yes" : "No"}</td>
                      <td>
                        <button
                          className={`${styles.iconButton} ${styles.editIcon}`}
                          onClick={() => handleEdit(row)}
                          title="Edit"
                          disabled={!canEdit}
                        >
                          <FaRegEdit />
                        </button>
                        <button
                          className={`${styles.iconButton} ${styles.deleteIcon}`}
                          onClick={() => handleDelete(row)}
                          title="Delete"
                          disabled={!canDelete}
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

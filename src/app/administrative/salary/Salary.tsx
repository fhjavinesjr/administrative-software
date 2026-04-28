"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Salary.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE ?? "";
const API_URL = `${API_BASE_URL}/api/salary-period-setting`;

interface SalaryPeriodSettingDTO {
    salaryPeriodSettingId: number;
    salaryType: string;
    nthOrder: number;
    periodContext: string;
    cutoffStartDay: number;
    cutoffStartMonthOffset: number;
    cutoffEndDay: number;
    cutoffEndMonthOffset: number;
    salaryReleaseStartDay: number | null;
    salaryReleaseEndDay: number | null;
    isActive: boolean;
}

const MONTH_OFFSET_LABELS: Record<number, string> = {
    0: "Current Month",
    [-1]: "Previous Month",
    [-2]: "2 Months Ago",
};

function cutoffLabel(day: number, offset: number): string {
    const label = MONTH_OFFSET_LABELS[offset] ?? `Offset ${offset}`;
    return `${day} (${label})`;
}

const EMPTY_FORM = {
    salaryType: "SEMI_MONTHLY",
    nthOrder: 1,
    cutoffStartDay: 16,
    cutoffStartMonthOffset: -1,
    cutoffEndDay: 15,
    cutoffEndMonthOffset: 0,
    salaryReleaseStartDay: null as number | null,
    salaryReleaseEndDay: null as number | null,
};

const TOAST = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
});

export default function Salary() {
    const days1to31 = Array.from({ length: 31 }, (_, i) => i + 1);

    const [activeTab, setActiveTab] = useState<"PAYROLL" | "LEAVE">("PAYROLL");
    const [entries, setEntries] = useState<SalaryPeriodSettingDTO[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [salaryType, setSalaryType] = useState(EMPTY_FORM.salaryType);
    const [nthOrder, setNthOrder] = useState(EMPTY_FORM.nthOrder);
    const [periodContext, setPeriodContext] = useState<"PAYROLL" | "LEAVE" | "BOTH">("PAYROLL");
    const [cutoffStartDay, setCutoffStartDay] = useState(EMPTY_FORM.cutoffStartDay);
    const [cutoffStartMonthOffset, setCutoffStartMonthOffset] = useState(EMPTY_FORM.cutoffStartMonthOffset);
    const [cutoffEndDay, setCutoffEndDay] = useState(EMPTY_FORM.cutoffEndDay);
    const [cutoffEndMonthOffset, setCutoffEndMonthOffset] = useState(EMPTY_FORM.cutoffEndMonthOffset);
    const [salaryReleaseStartDay, setSalaryReleaseStartDay] = useState<number | null>(null);
    const [salaryReleaseEndDay, setSalaryReleaseEndDay] = useState<number | null>(null);

    // ── Load all settings on mount ──────────────────────────────────────────────
    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/get-all`);
            const json = await res.json();
            if (Array.isArray(json)) setEntries(json);
        } catch {
            // silently ignore
        } finally {
            setLoading(false);
        }
    };

    // Filter entries by active tab (BOTH entries show under both tabs)
    const visibleEntries = entries.filter(
        (e) => e.periodContext === activeTab || e.periodContext === "BOTH"
    );

    const resetForm = () => {
        setSalaryType(EMPTY_FORM.salaryType);
        setNthOrder(EMPTY_FORM.nthOrder);
        setPeriodContext(activeTab);
        setCutoffStartDay(EMPTY_FORM.cutoffStartDay);
        setCutoffStartMonthOffset(EMPTY_FORM.cutoffStartMonthOffset);
        setCutoffEndDay(EMPTY_FORM.cutoffEndDay);
        setCutoffEndMonthOffset(EMPTY_FORM.cutoffEndMonthOffset);
        setSalaryReleaseStartDay(null);
        setSalaryReleaseEndDay(null);
        setIsEditing(false);
        setEditId(null);
    };

    const buildPayload = () => ({
        salaryType,
        nthOrder,
        periodContext,
        cutoffStartDay,
        cutoffStartMonthOffset,
        cutoffEndDay,
        cutoffEndMonthOffset,
        salaryReleaseStartDay: activeTab === "PAYROLL" ? salaryReleaseStartDay : null,
        salaryReleaseEndDay: activeTab === "PAYROLL" ? salaryReleaseEndDay : null,
        isActive: true,
    });

    // ── Create ──────────────────────────────────────────────────────────────────
    const handleCreate = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPayload()),
            });
            if (res.ok) {
                await loadAll();
                TOAST.fire({ icon: "success", title: "Successfully Created!" });
                resetForm();
            } else {
                const json = await res.json();
                TOAST.fire({ icon: "error", title: json.message ?? "Failed to create." });
            }
        } catch {
            TOAST.fire({ icon: "error", title: "Server error." });
        }
    };

    // ── Update ──────────────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        if (editId === null) return;
        const result = await Swal.fire({
            text: "Are you sure you want to update this record?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Update",
        });
        if (!result.isConfirmed) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/update/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPayload()),
            });
            if (res.ok) {
                await loadAll();
                TOAST.fire({ icon: "success", title: "Successfully Updated!" });
                resetForm();
            } else {
                const json = await res.json();
                TOAST.fire({ icon: "error", title: json.message ?? "Failed to update." });
            }
        } catch {
            TOAST.fire({ icon: "error", title: "Server error." });
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────────
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            text: "Are you sure you want to delete this record?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#d33",
        });
        if (!result.isConfirmed) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/delete/${id}`, { method: "DELETE" });
            if (res.ok) {
                await loadAll();
                TOAST.fire({ icon: "success", title: "Deleted!" });
                resetForm();
            } else {
                const json = await res.json();
                TOAST.fire({ icon: "error", title: json.message ?? "Failed to delete." });
            }
        } catch {
            TOAST.fire({ icon: "error", title: "Server error." });
        }
    };

    const handleEdit = (entry: SalaryPeriodSettingDTO) => {
        setEditId(entry.salaryPeriodSettingId);
        setSalaryType(entry.salaryType);
        setNthOrder(entry.nthOrder);
        setPeriodContext(entry.periodContext as "PAYROLL" | "LEAVE" | "BOTH");
        setCutoffStartDay(entry.cutoffStartDay);
        setCutoffStartMonthOffset(entry.cutoffStartMonthOffset);
        setCutoffEndDay(entry.cutoffEndDay);
        setCutoffEndMonthOffset(entry.cutoffEndMonthOffset);
        setSalaryReleaseStartDay(entry.salaryReleaseStartDay);
        setSalaryReleaseEndDay(entry.salaryReleaseEndDay);
        setIsEditing(true);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            handleUpdate();
        } else {
            handleCreate();
        }
    };

    const handleTabSwitch = (tab: "PAYROLL" | "LEAVE") => {
        setActiveTab(tab);
        resetForm();
        setPeriodContext(tab);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Salary Period</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <div className={styles.periodType}>
                        <div className={styles.tabsHeader}>
                            <button
                                className={`${styles.tabButton} ${activeTab === "PAYROLL" ? styles.active : ""}`}
                                onClick={() => handleTabSwitch("PAYROLL")}>
                                Payroll
                            </button>
                            <button
                                className={`${styles.tabButton} ${activeTab === "LEAVE" ? styles.active : ""}`}
                                onClick={() => handleTabSwitch("LEAVE")}>
                                Leave Process
                            </button>
                        </div>
                    </div>

                    <form className={styles.SalaryForm} onSubmit={onSubmit}>
                        <label className={styles.empLabel}>Salary Type</label>
                        <select value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
                            <option value="MONTHLY">Monthly</option>
                            <option value="SEMI_MONTHLY">Semi-Monthly</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="DAILY">Daily</option>
                        </select>

                        <label className={styles.empLabel}>Order (Nth Period)</label>
                        <select
                            className={styles.cutOffFrom}
                            value={nthOrder}
                            onChange={(e) => setNthOrder(Number(e.target.value))}>
                            {[1, 2, 3, 4].map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>

                        <label className={styles.empLabel}>Period Context</label>
                        <select
                            value={periodContext}
                            onChange={(e) => setPeriodContext(e.target.value as "PAYROLL" | "LEAVE" | "BOTH")}>
                            <option value="PAYROLL">Payroll</option>
                            <option value="LEAVE">Leave</option>
                            <option value="BOTH">Both</option>
                        </select>

                        <label className={styles.empLabel}>Cut-Off Start</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <select
                                className={styles.cutOffFrom}
                                value={cutoffStartDay}
                                onChange={(e) => setCutoffStartDay(Number(e.target.value))}>
                                {days1to31.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                                className={styles.cutOffFromMonth}
                                value={cutoffStartMonthOffset}
                                onChange={(e) => setCutoffStartMonthOffset(Number(e.target.value))}>
                                <option value={0}>Current Month</option>
                                <option value={-1}>Previous Month</option>
                                <option value={-2}>2 Months Ago</option>
                            </select>
                        </div>

                        <label className={styles.empLabel}>Cut-Off End</label>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <select
                                className={styles.cutOffFrom}
                                value={cutoffEndDay}
                                onChange={(e) => setCutoffEndDay(Number(e.target.value))}>
                                {days1to31.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                                className={styles.cutOffFromMonth}
                                value={cutoffEndMonthOffset}
                                onChange={(e) => setCutoffEndMonthOffset(Number(e.target.value))}>
                                <option value={0}>Current Month</option>
                                <option value={-1}>Previous Month</option>
                            </select>
                        </div>

                        {activeTab === "PAYROLL" && (
                            <>
                                <label className={styles.empLabel}>Salary Release Start Day</label>
                                <select
                                    className={styles.cutOffFrom}
                                    value={salaryReleaseStartDay ?? ""}
                                    onChange={(e) => setSalaryReleaseStartDay(e.target.value ? Number(e.target.value) : null)}>
                                    <option value="">-- None --</option>
                                    {days1to31.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>

                                <label className={styles.empLabel}>Salary Release End Day</label>
                                <select
                                    className={styles.cutOffFrom}
                                    value={salaryReleaseEndDay ?? ""}
                                    onChange={(e) => setSalaryReleaseEndDay(e.target.value ? Number(e.target.value) : null)}>
                                    <option value="">-- None --</option>
                                    {days1to31.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </>
                        )}

                        <div className={styles.buttonGroup}>
                            <button type="submit" className={isEditing ? styles.updateButton : styles.saveButton}>
                                {isEditing ? "Update" : "Save"}
                            </button>
                            <button type="button" className={styles.clearButton} onClick={resetForm}>
                                Clear
                            </button>
                        </div>
                    </form>

                    <div className={styles.tableWrapper}>
                        {loading && <p>Loading...</p>}
                        {!loading && visibleEntries.length > 0 && (
                            <div className={styles.tableFade}>
                                <h4 className={styles.tableHeader}>
                                    LIST OF SALARY PERIOD ({activeTab}) SETTINGS
                                </h4>
                                <div className={styles.SalaryTable}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Order</th>
                                                <th>Context</th>
                                                <th>Cut-Off Start</th>
                                                <th>Cut-Off End</th>
                                                {activeTab === "PAYROLL" && <th>Release Start</th>}
                                                {activeTab === "PAYROLL" && <th>Release End</th>}
                                                <th>Active</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleEntries.map((entry) => (
                                                <tr key={entry.salaryPeriodSettingId}>
                                                    <td>{entry.salaryType.replace("_", "-")}</td>
                                                    <td>{entry.nthOrder}</td>
                                                    <td>{entry.periodContext}</td>
                                                    <td>{cutoffLabel(entry.cutoffStartDay, entry.cutoffStartMonthOffset)}</td>
                                                    <td>{cutoffLabel(entry.cutoffEndDay, entry.cutoffEndMonthOffset)}</td>
                                                    {activeTab === "PAYROLL" && <td>{entry.salaryReleaseStartDay ?? "—"}</td>}
                                                    {activeTab === "PAYROLL" && <td>{entry.salaryReleaseEndDay ?? "—"}</td>}
                                                    <td>{entry.isActive ? "Yes" : "No"}</td>
                                                    <td>
                                                        <button
                                                            className={`${styles.iconButton} ${styles.editIcon}`}
                                                            onClick={() => handleEdit(entry)}
                                                            title="Edit">
                                                            <FaRegEdit />
                                                        </button>
                                                        <button
                                                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                            onClick={() => handleDelete(entry.salaryPeriodSettingId)}
                                                            title="Delete">
                                                            <FaTrashAlt />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
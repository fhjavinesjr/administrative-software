"use client";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/PayrollSettings.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = runtimeConfig.getApiUrl("administrative");

export default function PayrollSettings() {
    type PayrollSettingsItem = {
        payrollSettingsId: number;
        effectivityDate: string;
        cutoffDays: number;
        peraProrationDivisor: number;
    };

    const [data, setData] = useState<PayrollSettingsItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [effectivityDate, setEffectivityDate] = useState("");
    const [cutoffDays, setCutoffDays] = useState("");
    const [peraProrationDivisor, setPeraProrationDivisor] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/payrollSettings/get-all`
            );
            if (!res.ok) throw new Error(await res.text());
            setData(await res.json());
        } catch (err) {
            console.error("Failed to load Payroll Settings:", err);
            Swal.fire("Error", "Failed to load payroll settings data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!effectivityDate || !cutoffDays || !peraProrationDivisor) {
            Swal.fire("Validation Error", "All fields are required.", "warning");
            return;
        }

        const payload = {
            effectivityDate: toCustomFormat(effectivityDate, false),
            cutoffDays: parseInt(cutoffDays, 10),
            peraProrationDivisor: parseInt(peraProrationDivisor, 10),
        };

        try {
            if (!isEditing) {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/payrollSettings/create`,
                    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
                );
                if (!res.ok) throw new Error(await res.text());
                Swal.fire({ icon: "success", title: "Saved!", text: "Payroll settings created.", timer: 1500, showConfirmButton: false });
            } else {
                const confirm = await Swal.fire({
                    icon: "question",
                    title: "Update Record?",
                    text: "Are you sure you want to update this record?",
                    showCancelButton: true,
                    confirmButtonText: "Yes, update it!",
                });
                if (!confirm.isConfirmed) return;
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/payrollSettings/update/${editId}`,
                    { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
                );
                if (!res.ok) throw new Error(await res.text());
                Swal.fire({ icon: "success", title: "Updated!", text: "Payroll settings updated.", timer: 1500, showConfirmButton: false });
                setIsEditing(false);
                setEditId(null);
            }
            await loadData();
            handleClear();
        } catch (err) {
            console.error("Save failed:", err);
            Swal.fire("Error", "Failed to save record.", "error");
        }
    };

    const handleEdit = (item: PayrollSettingsItem) => {
        setEditId(item.payrollSettingsId);
        setEffectivityDate(toDateInputValue(item.effectivityDate));
        setCutoffDays(String(item.cutoffDays));
        setPeraProrationDivisor(String(item.peraProrationDivisor));
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "This action cannot be undone.",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });
        if (!result.isConfirmed) return;
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/payrollSettings/delete/${id}`,
                { method: "DELETE" }
            );
            if (!res.ok) throw new Error(await res.text());
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
            await loadData();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete record.", "error");
        }
    };

    const handleClear = () => {
        setEffectivityDate("");
        setCutoffDays("");
        setPeraProrationDivisor("");
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Payroll Settings</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.PayrollSettingsForm} onSubmit={onSubmit}>
                        <label>Effectivity Date</label>
                        <input
                            type="date"
                            value={effectivityDate}
                            onChange={e => setEffectivityDate(e.target.value)}
                            required
                        />

                        <label>Cutoff Days</label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={cutoffDays}
                            onChange={e => setCutoffDays(e.target.value)}
                            placeholder="e.g. 22"
                            required
                        />
                        <span className={styles.fieldNote}>
                            Number of working days used as the salary period divisor (default: 22).
                        </span>

                        <label>PERA Proration Divisor</label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={peraProrationDivisor}
                            onChange={e => setPeraProrationDivisor(e.target.value)}
                            placeholder="e.g. 22"
                            required
                        />
                        <span className={styles.fieldNote}>
                            Divisor used for PERA absent-day proration (default: 22).
                        </span>

                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={isEditing ? styles.updateButton : styles.saveButton}
                                disabled={loading}
                            >
                                {isEditing ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClear}
                                disabled={loading}
                            >
                                Clear
                            </button>
                        </div>
                    </form>

                    {data.length > 0 && (
                        <div className={styles.PayrollSettingsTable}>
                            <p className={styles.tableHeader}>PAYROLL SETTINGS HISTORY</p>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Effectivity Date</th>
                                        <th>Cutoff Days</th>
                                        <th>PERA Proration Divisor</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => (
                                        <tr key={item.payrollSettingsId}>
                                            <td>{item.effectivityDate}</td>
                                            <td>{item.cutoffDays}</td>
                                            <td>{item.peraProrationDivisor}</td>
                                            <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(item)}
                                                    title="Edit"
                                                    disabled={loading}
                                                >
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(item.payrollSettingsId)}
                                                    title="Delete"
                                                    disabled={loading}
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

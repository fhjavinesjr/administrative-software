"use client";

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Gsis.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function Gsis() {
    type GsisContributionItem = {
        gsisContributionId: number;
        effectivityDate: string;
        employerSharePercentage: string;
        employeeSharePercentage: string;
    };

    const [gsisData, setGsisData] = useState<GsisContributionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [effectivityDate, setEffectivityDate] = useState("");
    const [employerSharePercentage, setEmployerSharePercentage] = useState("");
    const [employeeSharePercentage, setEmployeeSharePercentage] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // LOAD DATA
    useEffect(() => {
        loadGsisData();
    }, []);

    const loadGsisData = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/gsisContribution/get-all`
            );
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setGsisData(data);
        } catch (err) {
            console.error("Failed to load GSIS data:", err);
            Swal.fire("Error", "Failed to load GSIS contribution data.", "error");
        } finally {
            setLoading(false);
        }
    };

    // SAVE + UPDATE
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!effectivityDate || !employerSharePercentage || !employeeSharePercentage) {
            Swal.fire("Validation Error", "All fields are required.", "warning");
            return;
        }

        const payload = {
            effectivityDate: toCustomFormat(effectivityDate, false),
            employerSharePercentage,
            employeeSharePercentage,
        };

        try {
            if (!isEditing) {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/gsisContribution/create`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) throw new Error(await res.text());

                Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: "GSIS Contribution created successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/gsisContribution/update/${editId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) throw new Error(await res.text());

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "GSIS Contribution updated successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                setIsEditing(false);
                setEditId(null);
            }

            await loadGsisData();
            setEffectivityDate("");
            setEmployerSharePercentage("");
            setEmployeeSharePercentage("");
        } catch (err) {
            console.error("Save failed:", err);
            Swal.fire("Error", "Failed to save record.", "error");
        }
    };

    // EDIT BUTTON
    const handleEdit = (obj: GsisContributionItem) => {
        setEditId(obj.gsisContributionId);
        setEffectivityDate(toDateInputValue(obj.effectivityDate));
        setEmployerSharePercentage(obj.employerSharePercentage);
        setEmployeeSharePercentage(obj.employeeSharePercentage);
        setIsEditing(true);
    };

    // DELETE with Swal confirm
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "This action cannot be undone.",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/gsisContribution/delete/${id}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error(await res.text());

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Record has been deleted.",
                timer: 1500,
                showConfirmButton: false,
            });

            await loadGsisData();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete record.", "error");
        }
    };

    const handleClear = () => {
        setEffectivityDate("");
        setEmployerSharePercentage("");
        setEmployeeSharePercentage("");
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>GSIS Contribution Table</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <form className={styles.GsisForm} onSubmit={onSubmit}>
                        <label>Effectivity Date</label>
                        <input
                            type="date"
                            value={effectivityDate}
                            onChange={e => setEffectivityDate(e.target.value)}
                            required
                        />

                        <label className={styles.empLabel}>Employer&apos;s Share (%)</label>
                        <input
                            type="text"
                            value={employerSharePercentage}
                            onChange={e => setEmployerSharePercentage(e.target.value)}
                            required
                        />

                        <label className={styles.empLabel}>Employee&apos;s Share (%)</label>
                        <input
                            type="text"
                            value={employeeSharePercentage}
                            onChange={e => setEmployeeSharePercentage(e.target.value)}
                            required
                        />

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

                    {gsisData.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>GSIS SCHEDULE OF CONTRIBUTION FOR EMPLOYED MEMBERS</h4>
                            <div className={styles.GsisTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Effectivity Date</th>
                                            <th>Employer Share (%)</th>
                                            <th>Employee Share (%)</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gsisData.map((item) => (
                                            <tr key={item.gsisContributionId}>
                                                <td>{item.effectivityDate}</td>
                                                <td>{item.employerSharePercentage}</td>
                                                <td>{item.employeeSharePercentage}</td>
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
                                                        onClick={() => handleDelete(item.gsisContributionId)}
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
"use client"

import React, { useState, useEffect, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Tax.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

export default function Tax() {
    type WTAXContributionItem = {
        wTaxContributionId: number;
        salaryType: string;
        fixedAmount: string;
        percentageOverBase: string;
        taxAmount: string;
    };

    const [salaryType, setSalaryType] = useState("Monthly");
    const [fixed, setFixed] = useState("");
    const [percentage, setPercentage] = useState("");
    const [amount, setAmount] = useState("");
    const [monthly, setMonthly] = useState<WTAXContributionItem[]>([]);
    const [semiMonthly, setSemiMonthly] = useState<WTAXContributionItem[]>([]);
    const [weekly, setWeekly] = useState<WTAXContributionItem[]>([]);
    const [daily, setDaily] = useState<WTAXContributionItem[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const loadTaxData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE}/api/wTAXContribution/get-all`);
            if (!res.ok) throw new Error(await res.text());
            const data: WTAXContributionItem[] = await res.json();

            setMonthly(data.filter(d => d.salaryType === "Monthly"));
            setSemiMonthly(data.filter(d => d.salaryType === "Semi-Monthly"));
            setWeekly(data.filter(d => d.salaryType === "Weekly"));
            setDaily(data.filter(d => d.salaryType === "Daily"));
        } catch (err) {
            console.error("Failed to load tax data:", err);
            Swal.fire("Error", "Failed to load tax contribution data.", "error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadTaxData(); }, [loadTaxData]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fixed || !percentage || !amount) {
            Swal.fire("Validation Error", "All fields are required.", "warning");
            return;
        }

        const payload = {
            salaryType,
            fixedAmount: fixed,
            percentageOverBase: percentage,
            taxAmount: amount,
        };

        try {
            if (!isEditing) {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE}/api/wTAXContribution/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(await res.text());
                Swal.fire({ icon: "success", title: "Saved!", timer: 1500, showConfirmButton: false });
            } else {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE}/api/wTAXContribution/update/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error(await res.text());
                Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
                setIsEditing(false);
                setEditId(null);
            }

            await loadTaxData();
            handleClear();
        } catch (err) {
            console.error("Save failed:", err);
            Swal.fire("Error", "Failed to save record.", "error");
        }
    };

    const handleClear = () => {
        setSalaryType("Monthly");
        setFixed("");
        setPercentage("");
        setAmount("");
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (obj: WTAXContributionItem) => {
        setEditId(obj.wTaxContributionId);
        setSalaryType(obj.salaryType);
        setFixed(obj.fixedAmount);
        setPercentage(obj.percentageOverBase);
        setAmount(obj.taxAmount);
        setIsEditing(true);
    };

    const handleDelete = async (idOrObj: number | WTAXContributionItem) => {
        const id = typeof idOrObj === "number" ? idOrObj : idOrObj.wTaxContributionId;
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
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE}/api/wTAXContribution/delete/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
            await loadTaxData();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete record.", "error");
        }
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>With-Holding Tax Table</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.TaxForm}  onSubmit={onSubmit}>
                        <label>Salary Type</label>
                        <select
                            value={salaryType}
                            onChange={(e) => setSalaryType(e.target.value)}>
                                <option value="Monthly">Monthly</option>
                                <option value="Semi-Monthly">Semi-Monthly</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Daily">Daily</option>
                        </select>
                        <label>Fixed Amount</label>
                        <input
                            className={styles.date}
                            type="text"
                            value={fixed}
                            onChange={e => setFixed(e.target.value)}
                            required={true}
                        />
                        <label>Percentage Over Base</label>
                         <input
                            className={styles.date}
                            type="text"
                            value={percentage}
                            onChange={e => setPercentage(e.target.value)}
                            required={true}
                        />
                        <label>Amount</label>
                         <input
                            className={styles.date}
                            type="text"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required={true}
                        />
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={isEditing ? styles.updateButton : styles.saveButton} disabled={loading}>
                                {isEditing ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className={styles.clearButton}
                                disabled={loading}>
                                Clear
                            </button>
                        </div>
                    </form>

                    {monthly.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES MONTHLY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {monthly.map((m, idx) => (
                                                <th key={idx}>{idx + 1}</th>
                                                ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{monthly[0]?.salaryType}</td>
                                            {monthly.map((m, mindx) => (
                                            <td key={mindx}>
                                                <span>{m.fixedAmount}</span>
                                                <p>+ {m.percentageOverBase} Over</p>
                                                <p>{m.taxAmount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m.wTaxContributionId)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {semiMonthly.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES SEMI-MONTHLY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {semiMonthly.map((m, idx) => (
                                            <th key={idx}>{idx + 1}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{semiMonthly[0]?.salaryType}</td>
                                            {semiMonthly.map((m, mindx) => (
                                            <td key={mindx}>
                                                <span>{m.fixedAmount}</span>
                                                <p>+ {m.percentageOverBase} Over</p>
                                                <p>{m.taxAmount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m.wTaxContributionId)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {weekly.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES WEEKLY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {weekly.map((m, idx) => (
                                            <th key={idx}>{idx + 1}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{weekly[0]?.salaryType}</td>
                                            {weekly.map((m, mindx) => (
                                            <td key={mindx}>
                                                <span>{m.fixedAmount}</span>
                                                <p>+ {m.percentageOverBase} Over</p>
                                                <p>{m.taxAmount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m.wTaxContributionId)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {daily.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES DAILY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {daily.map((m, idx) => (
                                            <th key={idx}>{idx + 1}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{daily[0]?.salaryType}</td>
                                            {daily.map((m, mindx) => (
                                            <td key={mindx}>
                                                <span>{m.fixedAmount}</span>
                                                <p>+ {m.percentageOverBase} Over</p>
                                                <p>{m.taxAmount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m.wTaxContributionId)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
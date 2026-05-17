"use client";

import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/DeductionType.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type DeductionTypeEntry = {
    deductionTypeId?: number;
    accountingCode: string;
    name: string;
    mandatoryDeduction: boolean;
    gsis: boolean;
    philHealth: boolean;
    pagIbig: boolean;
    withholdingTax: boolean;
    union: boolean;
    others: boolean;
};

const deductionFields: { key: keyof ReturnType<typeof defaultFlags>; label: string }[] = [
    { key: "mandatoryDeduction", label: "Mandatory Deduction" },
    { key: "gsis",               label: "GSIS" },
    { key: "philHealth",         label: "PhilHealth" },
    { key: "pagIbig",            label: "PagIbig" },
    { key: "withholdingTax",     label: "Withholding Tax" },
    { key: "union",              label: "Union" },
    { key: "others",             label: "Others" },
];

const defaultFlags = (): Omit<DeductionTypeEntry, "deductionTypeId" | "accountingCode" | "name"> => ({
    mandatoryDeduction: false,
    gsis: false,
    philHealth: false,
    pagIbig: false,
    withholdingTax: false,
    union: false,
    others: false,
});

export default function DeductionTypes() {
    const [accountingCode, setAccountingCode] = useState("");
    const [name, setName] = useState("");
    const [flags, setFlags] = useState(defaultFlags());
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<DeductionTypeEntry | null>(null);
    const [arr, setArr] = useState<DeductionTypeEntry[]>([]);

    const toast = (icon: "success" | "error", title: string) =>
        Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        }).fire({ icon, title });

    const loadData = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL}/api/deductionType/get-all`);
            if (!res.ok) throw new Error();
            const data: DeductionTypeEntry[] = await res.json();
            setArr(data);
        } catch {
            toast("error", "Failed to load deduction types");
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleCheckboxChange = (key: keyof typeof flags) => {
        setFlags(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleClear = () => {
        setAccountingCode("");
        setName("");
        setFlags(defaultFlags());
        setIsEditing(false);
        setEditItem(null);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: DeductionTypeEntry = { accountingCode, name, ...flags };

        try {
            if (!isEditing) {
                const res = await fetchWithAuth(`${API_BASE_URL}/api/deductionType/create`, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error();
                toast("success", "Successfully Added!");
            } else if (editItem?.deductionTypeId) {
                const confirmed = await Swal.fire({
                    text: "Are you sure you want to update this record?",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Update",
                });
                if (!confirmed.isConfirmed) return;

                const res = await fetchWithAuth(`${API_BASE_URL}/api/deductionType/update/${editItem.deductionTypeId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error();
                toast("success", "Successfully Updated!");
            }
            handleClear();
            loadData();
        } catch {
            toast("error", "Operation failed");
        }
    };

    const handleEdit = (item: DeductionTypeEntry) => {
        setEditItem(item);
        setAccountingCode(item.accountingCode);
        setName(item.name);
        setFlags({
            mandatoryDeduction: item.mandatoryDeduction,
            gsis: item.gsis,
            philHealth: item.philHealth,
            pagIbig: item.pagIbig,
            withholdingTax: item.withholdingTax,
            union: item.union,
            others: item.others,
        });
        setIsEditing(true);
    };

    const handleDelete = (item: DeductionTypeEntry) => {
        Swal.fire({
            text: `Are you sure you want to delete "${item.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (result.isConfirmed && item.deductionTypeId) {
                try {
                    const res = await fetchWithAuth(`${API_BASE_URL}/api/deductionType/delete/${item.deductionTypeId}`, { method: "DELETE" });
                    if (!res.ok) throw new Error();
                    toast("success", "Successfully Deleted!");
                    loadData();
                } catch {
                    toast("error", "Delete failed");
                }
            }
        });
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Deduction Types</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.DeductionTypeForm} onSubmit={onSubmit}>
                        <label>Accounting Code</label>
                        <input
                            type="text"
                            value={accountingCode}
                            onChange={(e) => setAccountingCode(e.target.value)}
                            required
                        />
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <h4 className={styles.settings}>DEDUCTION SETTINGS</h4>
                        <div className={styles.rowContainer}>
                            <div className={styles.colContainer}>
                                {deductionFields.map(({ label }) => (
                                    <div key={label} className={styles.rowItem}>{label}:</div>
                                ))}
                            </div>
                            <div className={styles.colContainer2}>
                                {deductionFields.map(({ key }) => (
                                    <div key={key} className={styles.rowItem}>
                                        <input
                                            type="checkbox"
                                            checked={flags[key] as boolean}
                                            onChange={() => handleCheckboxChange(key)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={isEditing ? styles.updateButton : styles.saveButton}>
                                {isEditing ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClear}>
                                Clear
                            </button>
                        </div>
                    </form>

                    {arr.length > 0 && (
                        <div className={styles.DeductionTypeTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Accounting Code</th>
                                        <th>Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arr.map((m) => (
                                        <tr key={m.deductionTypeId}>
                                            <td>{m.accountingCode}</td>
                                            <td>{m.name}</td>
                                            <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(m)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(m)}
                                                    title="Delete">
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

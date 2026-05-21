"use client";

import { runtimeConfig } from "@/lib/utils/runtimeConfig";
import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/EarningType.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL = runtimeConfig.getApiUrl("administrative");

type EarningTypeEntry = {
    earningTypeId?: number;
    accountingCode: string;
    name: string;
    taxable: boolean;
    allowance: boolean;
    dailyBasis: boolean;
    basic: boolean;
    rata: boolean;
    honorarium: boolean;
    ecola: boolean;
    up: boolean;
    fixedHousing: boolean;
    representation: boolean;
    transportation: boolean;
    longevity: boolean;
    laundry: boolean;
    hazardPay: boolean;
    pera: boolean;
    subsistence: boolean;
    specialPayroll: boolean;
};

const earningFields: { key: keyof ReturnType<typeof defaultFlags>; label: string }[] = [
    { key: "taxable",       label: "Taxable" },
    { key: "allowance",     label: "Allowance" },
    { key: "dailyBasis",    label: "Daily Basis" },
    { key: "basic",         label: "Basic" },
    { key: "rata",          label: "RATA" },
    { key: "honorarium",    label: "Honorarium" },
    { key: "ecola",         label: "ECOLA" },
    { key: "up",            label: "UP" },
    { key: "fixedHousing",  label: "Fixed Housing" },
    { key: "representation",label: "Representation" },
    { key: "transportation",label: "Transportation" },
    { key: "longevity",     label: "Longevity" },
    { key: "laundry",       label: "Laundry" },
    { key: "hazardPay",     label: "Hazard Pay" },
    { key: "pera",          label: "PERA" },
    { key: "subsistence",   label: "Subsistence" },
    { key: "specialPayroll",label: "Special Payroll" },
];

const defaultFlags = (): Omit<EarningTypeEntry, "earningTypeId" | "accountingCode" | "name"> => ({
    taxable: false, allowance: false, dailyBasis: false, basic: false,
    rata: false, honorarium: false, ecola: false, up: false,
    fixedHousing: false, representation: false, transportation: false,
    longevity: false, laundry: false, hazardPay: false, pera: false,
    subsistence: false, specialPayroll: false,
});

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function EarningTypes() {
    const [accountingCode, setAccountingCode] = useState("");
    const [name, setName] = useState("");
    const [flags, setFlags] = useState(defaultFlags());
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<EarningTypeEntry | null>(null);
    const [arr, setArr] = useState<EarningTypeEntry[]>([]);

    // ── Pagination / search ───────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
            const res = await fetchWithAuth(`${API_BASE_URL}/api/earningType/get-all`);
            if (!res.ok) throw new Error();
            const data: EarningTypeEntry[] = await res.json();
            setArr([...data].sort((a, b) => a.name.localeCompare(b.name)));
        } catch {
            toast("error", "Failed to load earning types");
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Reset to page 1 whenever search term or page size changes
    useEffect(() => { setCurrentPage(1); }, [search, itemsPerPage]);

    const filteredArr = arr.filter((item) => {
        const q = search.toLowerCase();
        return item.accountingCode.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    });
    const totalPages = Math.ceil(filteredArr.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedArr = filteredArr.slice(startIndex, startIndex + itemsPerPage);

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
        const payload: EarningTypeEntry = { accountingCode, name, ...flags };

        try {
            if (!isEditing) {
                const res = await fetchWithAuth(`${API_BASE_URL}/api/earningType/create`, {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error();
                toast("success", "Successfully Added!");
            } else if (editItem?.earningTypeId) {
                const confirmed = await Swal.fire({
                    text: "Are you sure you want to update this record?",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Update",
                });
                if (!confirmed.isConfirmed) return;

                const res = await fetchWithAuth(`${API_BASE_URL}/api/earningType/update/${editItem.earningTypeId}`, {
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

    const handleEdit = (item: EarningTypeEntry) => {
        setEditItem(item);
        setAccountingCode(item.accountingCode);
        setName(item.name);
        setFlags({
            taxable: item.taxable, allowance: item.allowance, dailyBasis: item.dailyBasis,
            basic: item.basic, rata: item.rata, honorarium: item.honorarium,
            ecola: item.ecola, up: item.up, fixedHousing: item.fixedHousing,
            representation: item.representation, transportation: item.transportation,
            longevity: item.longevity, laundry: item.laundry, hazardPay: item.hazardPay,
            pera: item.pera, subsistence: item.subsistence, specialPayroll: item.specialPayroll,
        });
        setIsEditing(true);
    };

    const handleDelete = (item: EarningTypeEntry) => {
        Swal.fire({
            text: `Are you sure you want to delete "${item.name}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (result.isConfirmed && item.earningTypeId) {
                try {
                    const res = await fetchWithAuth(`${API_BASE_URL}/api/earningType/delete/${item.earningTypeId}`, { method: "DELETE" });
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
                    <h2 className={modalStyles.mainTitle}>Earning Types</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.EarningTypeForm} onSubmit={onSubmit}>
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

                        <h4 className={styles.settings}>EARNING SETTINGS</h4>

                        <div className={styles.checkboxGroup}>
                            {earningFields.map(({ key, label }) => (
                                <div key={key} className={styles.checkboxItem}>
                                    <label>{label}:</label>
                                    <input
                                        type="checkbox"
                                        checked={flags[key] as boolean}
                                        onChange={() => handleCheckboxChange(key)}
                                    />
                                </div>
                            ))}
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
                        <div className={styles.EarningTypeTable}>
                            {/* Search + Pagination controls */}
                            <div className={styles.searchBar}>
                                <input
                                    type="text"
                                    placeholder="Search by code or name…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <div className={styles.paginationControls}>
                                    <label>Rows:</label>
                                    <select
                                        className={styles.rowSelect}
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    >
                                        {PAGE_SIZE_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <span className={styles.recordInfo}>
                                        {filteredArr.length === 0 ? "0" : startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredArr.length)} of {filteredArr.length}
                                    </span>
                                    <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>First</button>
                                    <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
                                    <span className={styles.pageIndicator}>Page {currentPage} of {totalPages || 1}</span>
                                    <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
                                    <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}>Last</button>
                                </div>
                            </div>

                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Accounting Code</th>
                                        <th>Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedArr.length === 0 ? (
                                        <tr><td colSpan={3} style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}>No records found.</td></tr>
                                    ) : paginatedArr.map((m) => (
                                        <tr key={m.earningTypeId}>
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
"use client"

import React, { useEffect, useState, useCallback } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/EmployeeRequest.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type EmployeeRequestEntry = {
    employeeRequestId?: number;
    code: string;
    name: string;
    max: number;
};

export default function EmployeeRequest() {
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [max, setMax] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<EmployeeRequestEntry | null>(null);
    const [entry, setEntry] = useState<EmployeeRequestEntry[]>([]);

    const toast = (icon: "success" | "error", title: string) =>
        Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        }).fire({ icon, title });

    const loadEmployeeRequests = useCallback(async () => {
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/employeeRequest/get-all`
            );

            if (!response.ok) throw new Error();

            const data: EmployeeRequestEntry[] = await response.json();
            setEntry(data);
        } catch {
            toast("error", "Failed to load employee requests");
        }
    }, []);

    useEffect(() => {
        loadEmployeeRequests();
    }, [loadEmployeeRequests]);

    const handleClear = () => {
        setCode("");
        setName("");
        setMax(0);
        setIsEditing(false);
        setEditItem(null);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = { code, name, max };

        try {
            if (!isEditing) {
                const response = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/employeeRequest/create`,
                    { method: "POST", body: JSON.stringify(payload) }
                );

                if (!response.ok) throw new Error();

                toast("success", "Successfully Added!");
                handleClear();
                loadEmployeeRequests();
            } else {
                Swal.fire({
                    text: `Are you sure you want to update this record?`,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Update",
                    allowOutsideClick: true,
                    backdrop: true,
                }).then(async (result) => {
                    if (result.isConfirmed && editItem?.employeeRequestId) {
                        const response = await fetchWithAuth(
                            `${API_BASE_URL_ADMINISTRATIVE}/api/employeeRequest/update/${editItem.employeeRequestId}`,
                            { method: "PUT", body: JSON.stringify(payload) }
                        );

                        if (!response.ok) throw new Error();

                        toast("success", "Successfully Updated!");
                        handleClear();
                        loadEmployeeRequests();
                    }
                });
            }
        } catch {
            toast("error", "Operation failed");
        }
    };

    const handleDelete = (item: EmployeeRequestEntry) => {
        Swal.fire({
            text: `Are you sure you want to delete the "${item.name}" record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(async (result) => {
            if (result.isConfirmed && item.employeeRequestId) {
                try {
                    const response = await fetchWithAuth(
                        `${API_BASE_URL_ADMINISTRATIVE}/api/employeeRequest/delete/${item.employeeRequestId}`,
                        { method: "DELETE" }
                    );

                    if (!response.ok) throw new Error();

                    toast("success", "Successfully Deleted!");
                    loadEmployeeRequests();
                } catch {
                    toast("error", "Delete failed");
                }
            }
        });
    };

    const handleEdit = (obj: EmployeeRequestEntry) => {
        setEditItem(obj);
        setCode(obj.code);
        setName(obj.name);
        setMax(obj.max);
        setIsEditing(true);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Employee Request</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.EmployeeRequestForm} onSubmit={onSubmit}>
                        <label>Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required={true}
                        />
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required={true}
                        />
                        <label>Max. Count of Approval</label>
                        <input
                            type="text"
                            value={max}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (!Number.isNaN(value)) setMax(value);
                            }}
                            required={true}
                        />
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={isEditing ? styles.updateButton : styles.saveButton}>
                                {isEditing ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClear}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                    {entry.length > 0 && (
                        <div className={styles.EmployeeRequestTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Description</th>
                                        <th>Maximum Count of Approval</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entry.map((ent) => (
                                        <tr key={ent.employeeRequestId}>
                                            <td>{ent.code}</td>
                                            <td>{ent.name}</td>
                                            <td>{ent.max}</td>
                                            <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(ent)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(ent)}
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
    )
}
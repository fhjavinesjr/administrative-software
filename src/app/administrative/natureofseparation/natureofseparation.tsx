"use client"

import React, { useEffect, useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Natureofseparation.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function Natureofseparation() {
    type SeparationEntry = {
        natureOfSeparationId?: number;
        code: string;
        nature: string;
    };
    
    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/natureOfSeparation/get-all`);
            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();
            setApp(data);
        } catch (error) {
            console.error(error);
        }
    };


    const [code, setCode] = useState("");
    const [nature, setNature] = useState("");
    const [slct_app, setApp] = useState<SeparationEntry[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing) {
            const response = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfSeparation/create`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code, nature }),
                }
            );

            const result = await response.json();

            if (response.ok) {
                fetchAll(); // reload list
                const Toast = Swal.mixin({
                    toast: true,
                    position: "bottom-end",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });

                Toast.fire({
                    icon: "success",
                    title: "Successfully Added!"
                });
            } else {
                Swal.fire({ icon: "error", title: result.message || "Failed to save" });
            }

            setCode("");
            setNature("");
        } else {
            if (editIndex !== null) {
                Swal.fire({
                    text: `Are you sure you want to update this record?`,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Update",
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const selected = slct_app[editIndex];

                        const response = await fetchWithAuth(
                            `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfSeparation/update/${selected.natureOfSeparationId}`,
                            {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ code, nature }),
                            }
                        );

                        const data = await response.json();

                        if (response.ok) {
                            const Toast = Swal.mixin({
                                toast: true,
                                position: "bottom-end",
                                showConfirmButton: false,
                                timer: 2000,
                                timerProgressBar: true,
                                didOpen: (toast) => {
                                    toast.onmouseenter = Swal.stopTimer;
                                    toast.onmouseleave = Swal.resumeTimer;
                                }
                            });

                            Toast.fire({
                                icon: "success",
                                title: "Successfully Updated!"
                            });

                            fetchAll();
                        } else {
                            Swal.fire({ icon: "error", title: data.message || "Update failed" });
                        }

                        setCode("");
                        setNature("");
                        setIsEditing(false);
                        setEditIndex(null);
                    }
                });
            }
        }
    };

    const handleDelete = (natureType: string, id: number) => {
        Swal.fire({
            text: `Are you sure you want to delete "${natureType}"?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfSeparation/delete/${id}`,
                    { method: "DELETE" }
                );

                if (response.ok) {
                    Swal.fire({ icon: "success", title: "Deleted!" });
                    fetchAll();
                } else {
                    Swal.fire({ icon: "error", title: "Failed to delete" });
                }
            }
        });
    };


    const handleEdit = (obj: SeparationEntry, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setNature(obj.nature);
        setIsEditing(true);
    };

    const handleClear = () => {
        setCode("");
        setNature("");
        setIsEditing(false);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Nature Of Separation</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.NatureofseparationForm} onSubmit={onSubmit}>
                        <label>Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required={true}
                        />
                        <label>Nature</label>
                        <input
                            type="text"
                            value={nature}
                            onChange={e => setNature(e.target.value)}
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

                    {slct_app.length > 0 && (
                        <div className={styles.NatureofseparationTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Nature</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slct_app.map((m, indx) => (
                                        <tr key={m.code ?? `row-${indx}`}>
                                            <td>{m.code}</td>
                                             <td>{m.nature}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(m, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(m.nature, m.natureOfSeparationId!)}
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
    )
}
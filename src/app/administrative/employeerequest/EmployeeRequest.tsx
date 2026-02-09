"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/EmployeeRequest.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function EmployeeRequest() {
    type EmployeeRequestEntry = {
        code: string;
        description: string;
        max: number;
    };
    
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [max, setMax] = useState<number>(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [entry, setEntry] = useState<EmployeeRequestEntry[]>([]);

    const handleClear = () => {
        setCode("");
        setDescription("");
        setMax(0);
        setIsEditing(false);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: EmployeeRequestEntry = { code, description, max };

        if(!isEditing) {
            setEntry([...entry, newEntry]);

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

            handleClear();
        } else {
            if(editIndex !== null) {
                Swal.fire({
                    text: `Are you sure you want to update this record?`,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Update",
                    allowOutsideClick: true,
                    backdrop: true,
                }).then(result => {
                    if(result.isConfirmed) {
                        const updateLeave = [...entry];
                        updateLeave[editIndex] = newEntry;
                        setEntry(updateLeave);
                        setIsEditing(false);
                        setEditIndex(null);

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

                        handleClear();
                    }
                })
            }
        }
    };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setDescription("");
            setMax(0);
            setIsEditing(false);
        }

            Swal.fire({
            text: `Are you sure you want to delete the "${type}" record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(result => {
            if(result.isConfirmed) {
                const res = entry.filter(s => s.code != type);
                setEntry(res);
            }
        })
    };

    const handleEdit = (obj: EmployeeRequestEntry, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setDescription(obj.description);
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
                        <label>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
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
                                    {entry.map((ent, indx) => (
                                        <tr key={ent.code ?? `row-${indx}`}>
                                            <td>{ent.code}</td>
                                             <td>{ent.description}</td>
                                             <td>{ent.max}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                   onClick={() => handleEdit(ent, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(ent.code)}
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
"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/CivilStatus.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function CivilStatus() {
    type CivilStatusItem = {
        code: string;
        status: string;
    }

    const [code, setCode] = useState("");
    const [status, setStatus] = useState("");
    const [datas, setData] = useState<CivilStatusItem[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [isEditing, setIsEditing] = useState(false);

    const handleClear = () => {
        setCode("");
        setStatus("");
        setIsEditing(false);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: CivilStatusItem = {code, status};

        if(!isEditing) {
            setData([...datas, newEntry]);

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
                title: "Successfully Created!"
            });

            setCode("");
            setStatus("");
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
                        const updateAppointment = [...datas];
                        updateAppointment[editIndex] = newEntry;
                        setData(updateAppointment);
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

                        setCode("");
                        setStatus("");
                    }
                })
                
            }
        }
        
    };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setStatus("");
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
                const arr = datas.filter(s => s.status != type);
                setData(arr);
            }
        })
    };

    const handleEdit = (obj: CivilStatusItem, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setStatus(obj.status);
        setIsEditing(true);
    };
        
    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Civil Status</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <form className={styles.CivilStatusForm} onSubmit={onSubmit}>
                        <label>Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required={true}
                        />
                        <label>Status</label>
                        <input
                            type="text"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
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

                    {datas.length > 0 && (
                        <div className={styles.CivilStatusTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Gender</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {datas.map((m, indx) => (
                                        <tr key={m.code ?? `row-${indx}`}>
                                            <td>{m.code}</td>
                                             <td>{m.status}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(m, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(m.status)}
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
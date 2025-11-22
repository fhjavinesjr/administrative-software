"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Gender.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Gender() {
    type GenderItem = {
        code: string;
        gender: string;
    }

    const [code, setCode] = useState("");
    const [gender, setGender] = useState("");
    const [datas, setData] = useState<GenderItem[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [isEditing, setIsEditing] = useState(false);

    const handleClear = () => {
        setCode("");
        setGender("");
        setIsEditing(false);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: GenderItem = {code, gender};

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
            setGender("");
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
                        setGender("");
                    }
                })
                
            }
        }
        
    };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setGender("");
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
                const arr = datas.filter(s => s.gender != type);
                setData(arr);
            }
        })
    };

    const handleEdit = (obj: GenderItem, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setGender(obj.gender);
        setIsEditing(true);
    };
        
    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Gender</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <form className={styles.GenderForm} onSubmit={onSubmit}>
                        <label>Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required={true}
                        />
                        <label>Gender</label>
                        <input
                            type="text"
                            value={gender}
                            onChange={e => setGender(e.target.value)}
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
                        <div className={styles.GenderTable}>
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
                                             <td>{m.gender}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(m, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(m.gender)}
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
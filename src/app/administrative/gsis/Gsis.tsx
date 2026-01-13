"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Gsis.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Gsis() {
    type GsisEntry = {
        date: string;
        erShare: string;
        eeShare: string;
    };

    const [date, setDate] = useState("");
    const [erShare, setErShare] = useState("");
    const [eeShare, setEeShare] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [entry, setEntry] = useState<GsisEntry[]>([]);

    const handleEdit = (obj: GsisEntry, index: number) => {
        setEditIndex(index);
        setDate(obj.date);
        setEeShare(obj.eeShare);
        setErShare(obj.erShare);
        setIsEditing(true);
    };

    const handleDelete = (indx: number) => {
        if(date) {
            setDate("");
            setErShare("");
            setEeShare("");
            setIsEditing(false);
        }

            Swal.fire({
            text: `Are you sure you want to delete this record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(result => {
            if(result.isConfirmed) {
                setEntry(prev => prev.filter((_, i) => i != indx));
            }
        })
    };

    const handleClear = () => {
        setDate("");
        setErShare("");
        setEeShare("");;
        setIsEditing(false);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: GsisEntry = { date, erShare, eeShare};

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
                title: "Successfully Created!"
            });

            setDate("");
            setErShare("");
            setEeShare("");
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

                        setDate("");
                        setErShare("");
                        setEeShare("");
                    }
                })
            }
        }
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
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required={true}
                        />
                        <label className={styles.empLabel}>Employer&apos;s Share</label>
                        <input
                            type="text"
                            value={erShare}
                            onChange={e => setErShare(e.target.value)}
                            required={true}
                            /><span className={styles.percent}>%</span>
                        <label className={styles.empLabel}>Employee&apos;s Share</label>
                        <input
                            type="text"
                            value={eeShare}
                            onChange={e => setEeShare(e.target.value)}
                            required={true}
                            /><span className={styles.percent}>%</span>
                         <div className={styles.buttonGroup}>
                            <button type="submit" className={isEditing ? styles.updateButton : styles.saveButton}>
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

                    {entry.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>GSIS SCHEDULE OF CONTRIBUTION FOR EMPLOYED MEMBERS</h4>
                            <div className={styles.GsisTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Effectivity Date</th>
                                            <th>Employer Share</th>
                                            <th>Employee Share</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.map((ent, indx) => (
                                            <tr key={ent.date ?? `row-${indx}`}>
                                                <td>{ent.date}</td>
                                                <td>{ent.erShare}</td>
                                                <td>{ent.eeShare}</td>
                                                <td>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                        onClick={() => handleEdit(ent, indx)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(indx)}
                                                        title="Delete">
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
    )
}
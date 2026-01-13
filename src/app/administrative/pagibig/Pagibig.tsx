"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/PagIbig.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Pagibig() {
    type PagibigEntry = {
        date: string;
        contribution: string;
        csErShare: string;
        csEeShare: string;
        msErShare: string;
        msEeShare: string;
    };
    const [date, setDate] = useState("");
    const [contribution, setContribution] = useState("");
    const [csErShare, setCsErShare] = useState("");
    const [csEeShare, setCsEeShare] = useState("");
    const [msErShare, setMsErShare] = useState("");
    const [msEeShare, setMsEeShare] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [entry, setEntry] = useState<PagibigEntry[]>([]);

    const [pagFixedAmount, setPagIbigFixedAmount] = useState("");
    const [pagIbigBasicMonthly, setPagIbigBasicMonthly] = useState("Basic Monthly Salary");

    const handleEdit = (obj: PagibigEntry, index: number) => {
        setEditIndex(index);
        setDate(obj.date);
        setContribution(obj.contribution);
        setCsErShare(obj.csErShare);
        setCsEeShare(obj.csEeShare);
        setMsErShare(obj.msErShare);
        setMsEeShare(obj.msEeShare);
        setIsEditing(true);
    };

    const handleDelete = (indx: number) => {
        if(date) {
            setDate("");
            setContribution("");
            setCsErShare("");
            setCsEeShare("");
            setMsErShare("");
            setMsEeShare("");
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
        setContribution("");
        setCsErShare("");
        setCsEeShare("");
        setMsErShare("");
        setMsEeShare("");
        setIsEditing(false);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: PagibigEntry = { date, contribution, csErShare, csEeShare, msErShare, msEeShare};
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
            setContribution("");
            setCsErShare("");
            setCsEeShare("");
            setMsErShare("");
            setMsEeShare("");
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
                        setContribution("");
                        setCsErShare("");
                        setCsEeShare("");
                        setMsErShare("");
                        setMsEeShare("");
                    }
                })
            }
        }
    }

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Pag-Ibig Contribution</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.PagibigForm} onSubmit={onSubmit}>
                        <label>Effectivity Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required={true}
                        />
                        <label className={styles.empLabel}>PAG-IBIG Contribution</label>
                        <input
                            className={styles.contriInput}
                            type="text"
                            value={contribution}
                            onChange={e => setContribution(e.target.value)}
                            required={true}
                        />
                        <select
                            value={pagFixedAmount}
                            onChange={(e) => setPagIbigFixedAmount(e.target.value)}>
                                <option value="Fixed Amount">Fixed Amount</option>
                        </select>
                        <select
                            value={pagIbigBasicMonthly}
                            onChange={(e) => setPagIbigBasicMonthly(e.target.value)}>
                                <option value="Basic Monthly Salary">Basic Monthly Salary</option>
                        </select>
                        <h4>Contribution Share</h4>
                        <label className={styles.empLabel}>Employer</label>
                        <input
                            className={styles.contriInput}
                            type="text"
                            value={csErShare}
                            onChange={e => setCsErShare(e.target.value)}
                            required={true}
                        />
                        <select
                            value={pagFixedAmount}
                            onChange={(e) => setPagIbigFixedAmount(e.target.value)}>
                                <option value="Fixed Amount">Fixed Amount</option>
                        </select>
                        <label className={styles.empLabel}>Employee</label>
                        <input
                            className={styles.contriInput}
                            type="text"
                            value={csEeShare}
                            onChange={e => setCsEeShare(e.target.value)}
                            required={true}
                        />
                        <select
                            value={pagFixedAmount}
                            onChange={(e) => setPagIbigFixedAmount(e.target.value)}>
                                <option value="Fixed Amount">Fixed Amount</option>
                        </select>
                        <h4>Maximum Share</h4>
                        <label className={styles.empLabel}>Employer</label>
                        <input
                            className={styles.contriInput}
                            type="text"
                            value={msErShare}
                            onChange={e => setMsErShare(e.target.value)}
                            required={true}
                        />
                        <label className={styles.empLabel}>Employee</label>
                        <input
                            className={styles.contriInput}
                            type="text"
                            value={msEeShare}
                            onChange={e => setMsEeShare(e.target.value)}
                            required={true}
                        />
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
                            <h4 className={styles.tableHeader}>PAG-IBIG SCHEDULE OF CONTRIBUTION FOR EMPLOYED MEMBERS</h4>
                            <div className={styles.PagibigTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Effectivity Date</th>
                                            <th>Pag-Ibig Contribution</th>
                                            <th>CS Employer</th>
                                            <th>CS Employee</th>
                                            <th>MS Employer</th>
                                            <th>MS Employer</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.map((ent, indx) => (
                                            <tr key={ent.date ?? `row-${indx}`}>
                                                <td>{ent.date}</td>
                                                <td>{ent.contribution}</td>
                                                <td>{ent.csErShare}</td>
                                                <td>{ent.csEeShare}</td>
                                                <td>{ent.msErShare}</td>
                                                <td>{ent.msEeShare}</td>
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
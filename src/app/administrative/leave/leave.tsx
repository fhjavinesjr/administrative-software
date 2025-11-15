"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Leave.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function Leave() {
    type LeaveEntry = {
        code: string;
        leave: string;
    };

    const [code, setCode] = useState("");
    const [leave, setLeave] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [arr, setArr] = useState<LeaveEntry[]>([]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: LeaveEntry = { code, leave };
        
        if(!isEditing) {
            setArr([...arr, newEntry]);
        } else {
            if(editIndex !== null) {
                const updateLeave = [...arr];
                updateLeave[editIndex] = newEntry;
                setArr(updateLeave);
                setIsEditing(false);
                setEditIndex(null);
            }
        }
        setCode("");
        setLeave("");
    };

    const handleClear = () => {
        setCode("");
        setLeave("");
        setIsEditing(false);
    };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setLeave("");
            setIsEditing(false);
        }

       const res = arr.filter(s => s.leave != type);
        setArr(res);
    };

    const handleEdit = (obj: LeaveEntry, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setLeave(obj.leave);
        setIsEditing(true);
    };
    
    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Leave</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.LeaveForm} onSubmit={onSubmit}>
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
                            value={leave}
                            onChange={e => setLeave(e.target.value)}
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

                    {arr.length > 0 && (
                         <div className={styles.LeaveTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Leave Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arr.map((a, indx) => (
                                        <tr key={a.code ?? `row-${indx}`}>
                                             <td>{a.code}</td>
                                             <td>{a.leave}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(a, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(a.leave)}
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
};
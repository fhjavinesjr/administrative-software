"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Officialengagement.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function Officialengagement() {
    const [official, setOfficial] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [arr, setArr] = useState<any[]>([]);

    const [officials, setOfficials] = useState([
        {id: 1, type: 'Official Business'},
        {id: 1, type: 'Official Time'},
    ]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry = { official };

        if(!isEditing) {
            setArr([...arr, newEntry]);
        } else {
            if(editIndex !== null) {
                const updateOfficial = [...arr];
                updateOfficial[editIndex] = newEntry;
                setArr(updateOfficial);
                setIsEditing(false);
                setEditIndex(null);
            }
        }

        setOfficial("");
    };

    const handleClear = () => {
        setOfficial("");
        setIsEditing(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setOfficial(selected);
    };

    const handleDelete = (type: string) => {
        if(official) {
            setOfficial("");
            setIsEditing(false);
        }

       const res = arr.filter(s => s.official != type);
        setArr(res);
    };

    const handleEdit = (official: string, index: number) => {

        setOfficial(official);
        setEditIndex(index);
        setIsEditing(true);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Official Engagement</h2>
                </div>
                <div className={modalStyles.modalBody}>
                     <form className={styles.OfficialForm} onSubmit={onSubmit}>
                        <label>Engagement Type</label>
                        <select
                            onChange={handleChange}
                            value={official}
                            required
                            className={styles.selectField}>
                            <option value="">-- Select --</option>
                                {officials.map((off, index) => (
                                    <option key={index} value={off.type}>
                                        {off.type}
                                        </option>
                                    ))}
                        </select>
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
                         <div className={styles.OfficialTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Engagement Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arr.map((a, indx) => (
                                        <tr key={a.official ?? `row-${indx}`}>
                                             <td>{a.official}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(a.official, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(a.official)}
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
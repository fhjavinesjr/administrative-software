"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/OfficialEngagement.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function OfficialEngagement() {
    type OfficialItem = {
        code: string;
        engagement: string;
    }
    
    const [code, setCode] = useState("");
    const [engagement, setEngagement] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [arr, setArr] = useState<OfficialItem[]>([]);

    // const officials = [
    //     { id: 1, type: 'Official Business' },
    //     { id: 2, type: 'Official Time' },
    // ];

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: OfficialItem = { code, engagement };

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

        setCode("");
        setEngagement("");
    };

    const handleClear = () => {
        setCode("");
        setEngagement("");
        setIsEditing(false);
    }

    // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const selected = e.target.value;
    //     setOfficial(selected);
    // };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setEngagement("");
            setIsEditing(false);
        }

       const res = arr.filter(s => s.engagement != type);
        setArr(res);
    };

    const handleEdit = (obj: OfficialItem, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setEngagement(obj.engagement);
        setIsEditing(true);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Official Engagement</h2>
                </div>
                <div className={modalStyles.modalBody}>
                     <form className={styles.OfficialEngagement} onSubmit={onSubmit}>
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
                            value={engagement}
                            onChange={e => setEngagement(e.target.value)}
                            required={true}
                        />
                        {/* <select
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
                        </select> */}
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
                                        <th>Code</th>
                                        <th>Engagement</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arr.map((a, indx) => (
                                        <tr key={a.code ?? `row-${indx}`}>
                                            <td>{a.code}</td>
                                             <td>{a.engagement}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(a, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(a.engagement)}
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
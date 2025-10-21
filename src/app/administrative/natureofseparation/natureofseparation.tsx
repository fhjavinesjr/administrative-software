"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Natureofseparation.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function Natureofseparation() {
    type SeparationEntry = {
        code: string;
        nature: string;
    };

    const [code, setCode] = useState("");
    const [nature, setNature] = useState("");
    const [slct_app, setApp] = useState<SeparationEntry[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
        

    // const appointments = [
    //     {id: 1, type: 'Resignation'},
    //     {id: 2, type: 'Retirement (Compulsory)'},
    //     {id: 3, type: 'Retirement (Optional)'},
    //     {id: 4, type: 'Death'},
    //     {id: 6, type: 'Dropped from Rolls'},
    //     {id: 7, type: 'Dismissal/Removal'},
    //     {id: 8, type: 'Separation Due to Reorganization'},
    //     {id: 9, type: 'Others'}
    // ];

    // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     const selected = e.target.value;
    //     setAppointment(selected);
    // };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: SeparationEntry = {code, nature};

        if(!isEditing) {
            setApp([...slct_app, newEntry]);
        } else {
            if(editIndex !== null) {
                const updateSeparation = [...slct_app];
                updateSeparation[editIndex] = newEntry;
                setApp(updateSeparation);
                setIsEditing(false);
                setEditIndex(null);
            }
        }

        setCode("");
        setNature("");
    };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setNature("");
            setIsEditing(false);
        }

        const arr = slct_app.filter(s => s.nature != type);
        setApp(arr);
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
                        {/* <select
                            onChange={handleChange}
                            value={appointment}
                            required
                            className={styles.selectField}>
                            <option value="">-- Select --</option>
                                {appointments.map((app, index) => (
                                    <option key={index} value={app.type}>
                                        {app.type}
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
                                                    onClick={() => handleDelete(m.nature)}
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
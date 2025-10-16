"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Natureofseparation.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function Natureofseparation() {
    const [slct_app, setApp] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
        
    const [appointment, setAppointment] = useState("");

    const [appointments, setAppointments] = useState([
        {id: 1, type: 'Resignation'},
        {id: 2, type: 'Retirement (Compulsory)'},
        {id: 3, type: 'Retirement (Optional)'},
        {id: 4, type: 'Death'},
        {id: 6, type: 'Dropped from Rolls'},
        {id: 7, type: 'Dismissal/Removal'},
        {id: 8, type: 'Separation Due to Reorganization'},
        {id: 9, type: 'Others'}
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setAppointment(selected);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry = { appointment };

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
        setAppointment("");
    };

    const handleDelete = (type: string) => {
        if(appointment) {
            setAppointment("");
            setIsEditing(false);
        }

        const arr = slct_app.filter(s => s.appointment != type);
        setApp(arr);
    };

    const handleEdit = (appointment: string, index: number) => {

        setAppointment(appointment);
        setEditIndex(index);
        setIsEditing(true);
    };

    const handleClear = () => {
        setAppointment("");

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
                        <label>Nature of Separation</label>

                        <select
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

                    {slct_app.length > 0 && (
                        <div className={styles.NatureofseparationTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Appointment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slct_app.map((m, indx) => (
                                        <tr key={m.appointment ?? `row-${indx}`}>
                                             <td>{m.appointment}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(m.appointment, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(m.appointment)}
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
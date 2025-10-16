"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Appointment.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function Appointment() {
    const [slct_app, setApp] = useState<any[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null)

    const [isEditing, setIsEditing] = useState(false);

    const [appointment, setAppointment] = useState("");

    const [appointments, setAppointments] = useState([
        {id: 1, type: 'Permanent'},
        {id: 2, type: 'Temporary'},
        {id: 3, type: 'Provisional'},
        {id: 4, type: 'Casual'},
        {id: 6, type: 'Contractual'},
        {id: 7, type: 'Co-terminous'},
        {id: 8, type: 'Job Order'},
        {id: 9, type: 'Contract of Service'}
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
                const updateAppointment = [...slct_app];
                updateAppointment[editIndex] = newEntry;
                setApp(updateAppointment);
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
                    <h2 className={modalStyles.mainTitle}>Nature Of Appointment</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <form className={styles.AppointmentForm} onSubmit={onSubmit}>
                        <label>Nature of Appointment</label>
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
                        <div className={styles.AppointmentTable}>
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
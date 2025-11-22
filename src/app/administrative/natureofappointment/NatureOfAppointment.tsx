"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/NatureOfAppointment.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function NatureOfAppointment() {
    type AppointmentItem = {
        code: string;
        nature: string;
    }

    const [code, setCode] = useState("");
    const [nature, setNature] = useState("");
    const [slct_app, setApp] = useState<AppointmentItem[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [isEditing, setIsEditing] = useState(false);

    // const appointments = [
    //     { id: 1, type: 'Permanent' },
    //     { id: 2, type: 'Temporary' },
    //     { id: 3, type: 'Provisional' },
    //     { id: 4, type: 'Casual' },
    //     { id: 6, type: 'Contractual' },
    //     { id: 7, type: 'Co-terminous' },
    //     { id: 8, type: 'Job Order' },
    //     { id: 9, type: 'Contract of Service' },
    // ];

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: AppointmentItem = {code, nature};

        if(!isEditing) {
            setApp([...slct_app, newEntry]);

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
                title: "Successfully Added!"
            });

            setCode("");
            setNature("");
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
                        const updateAppointment = [...slct_app];
                        updateAppointment[editIndex] = newEntry;
                        setApp(updateAppointment);
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
                        setNature("");
                    }
                })
            }
        }
    };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setNature("");
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
                const arr = slct_app.filter(s => s.nature != type);
                setApp(arr);
            }
        })      
    };

    const handleEdit = (obj: AppointmentItem, index: number) => {
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
                    <h2 className={modalStyles.mainTitle}>Nature Of Appointment</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <form className={styles.NatureOfAppointment} onSubmit={onSubmit}>
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
                        <div className={styles.AppointmentTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Appointment</th>
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
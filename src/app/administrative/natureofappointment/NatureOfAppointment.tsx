"use client";

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/NatureOfAppointment.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function NatureOfAppointment() {
    type NatureAPI = {
        natureOfAppointmentId: number;
        code: string;
        name: string;   // <-- updated
    };

    const [slct_app, setApp] = useState<NatureAPI[]>([]);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");  // <-- updated

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // LOAD DATA
    useEffect(() => {
        loadAppointmentData();
    }, []);

    const loadAppointmentData = async () => {
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/get-all`
            );
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setApp(data);
        } catch (err) {
            console.error("Failed to load:", err);
        }
    };

    // SAVE + UPDATE
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = { code, name };

        try {
            if (!isEditing) {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/create`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) throw new Error(await res.text());

                Swal.fire({
                    icon: "success",
                    title: "Saved!",
                    text: "Nature of Appointment created successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });

            } else {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/update/${editId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) throw new Error(await res.text());

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Nature of Appointment updated successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                setIsEditing(false);
                setEditId(null);
            }

            await loadAppointmentData();

            // Reset form
            setCode("");
            setName("");

        } catch (err) {
            console.error("Save failed:", err);
            Swal.fire("Error", "Failed to save record.", "error");
        }
    };

    // EDIT BUTTON
    const handleEdit = (obj: NatureAPI) => {
        setEditId(obj.natureOfAppointmentId);
        setCode(obj.code);
        setName(obj.name); // <-- updated
        setIsEditing(true);
    };

    // DELETE with Swal confirm
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Are you sure?",
            text: "This action cannot be undone.",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/natureOfAppointment/delete/${id}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error(await res.text());

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Record has been deleted.",
                timer: 1500,
                showConfirmButton: false,
            });

            await loadAppointmentData();

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete record.", "error");
        }
    };

    const handleClear = () => {
        setCode("");
        setName("");
        setIsEditing(false);
        setEditId(null);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Nature of Appointment123</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    
                    <form className={styles.NatureOfAppointment} onSubmit={onSubmit}>
                        <label>Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required
                        />

                        <label>Nature</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}   // <-- updated
                            required
                        />

                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={isEditing ? styles.updateButton : styles.saveButton}
                            >
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
                                        <th>Nature</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slct_app.map((item) => (
                                        <tr key={item.natureOfAppointmentId}>
                                            <td>{item.code}</td>
                                            <td>{item.name}</td>
                                            <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <FaRegEdit />
                                                </button>

                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(item.natureOfAppointmentId)}
                                                >
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
    );
}
"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Plantilla.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Plantilla() {
    type PlantillaItem = {
        plantillID: string;
        itemNo: string;
        position: string;
        grade: string;
    }

    const [plantilla, setPlantilla] = useState<PlantillaItem[]>([]);

    const [plantillID, setPlantillID] = useState("");
    const [itemNo, setItemNo] = useState("");
    const [position, setPosition] = useState("");
    const [grade, setGrade] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)

    const positions = [
        {id: 1, position: 'Software Engineer', grade: 3},
        {id: 2, position: 'Frontend Developer', grade: 4},
        {id: 3, position: 'Backend Developer', grade: 5},
        {id: 4, position: 'Full Stack Developer', grade: 6},
        {id: 5, position: 'DevOps Engineer', grade: 7}
    ];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        setPosition(selected);
        
        const res = positions.find(pos => pos.position == selected);

        if(res) {
            setPlantillID(res.id.toString());
            setGrade(res.grade.toString());
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // const newEntry = { plantillID, itemNo, position, grade };
        const newEntry: PlantillaItem = { plantillID, itemNo, position, grade };

        if(!isEditing) {
            setPlantilla([...plantilla, newEntry]);

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

            setItemNo("");
            setPosition("");
            setGrade("");
        } else {
            if (editIndex !== null) {
                Swal.fire({
                    text: `Are you sure you want to update this record?`,
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonText: "Update",
                    allowOutsideClick: true,
                    backdrop: true,
                }).then(result => {
                    if(result.isConfirmed) {
                        const updatePlantilla = [...plantilla];
                        updatePlantilla[editIndex] = newEntry;
                        setPlantilla(updatePlantilla);
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
                        setItemNo("");
                        setPosition("");
                        setGrade("");
                    }
                })
            }
        }
    };

    const handleEdit = (obj: PlantillaItem, index: number) => {
        setEditIndex(index);
        setPlantillID(obj.plantillID);
        setItemNo(obj.itemNo);
        setPosition(obj.position);
        setGrade(obj.grade);
        setIsEditing(true);
    };

    const handleDelete = (id: number) => {
        if(itemNo) {
            setItemNo("");
            setPosition("");
            setGrade("");
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
                const arr = plantilla.filter(plntll => plntll.plantillID != id.toString());
                setPlantilla(arr);
            }
        })
    };

    const handleClear = () => {
        setItemNo("");
        setPosition("");
        setGrade("");

        setIsEditing(false);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Plantilla</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <form className={styles.PlantillaForm} onSubmit={onSubmit}>
                        <label>Plantilla/Item No</label>
                        <input
                            type="text"
                            value={itemNo}
                            onChange={e => setItemNo(e.target.value)}
                            required={true}
                        />

                        <label>Position</label>
                        <select
                            onChange={handleChange}
                            value={position}
                            required
                            className={styles.selectField}
                            >
                            <option value="">-- Select --</option>
                            {positions.map((pos, index) => (
                                <option key={index} value={pos.position}>
                                {pos.position}
                                </option>
                            ))}
                        </select>

                        <label>Salary Grade</label>
                        <input
                            readOnly
                            value={grade}
                            type="text"
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

                    {plantilla.length > 0 && (
                        <div className={styles.PlantillaTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Plantilla/Item No</th>
                                        <th>Position</th>
                                        <th>Salary Grade</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plantilla.map((plntll, indx) => (
                                        <tr key={plntll.plantillID ?? `row-${indx}`}>
                                            <td>{plntll.itemNo}</td>
                                            <td>{plntll.position}</td>
                                            <td>{plntll.grade}</td>
                                            <td>
                                            <button
                                                className={`${styles.iconButton} ${styles.editIcon}`}
                                                onClick={() => handleEdit(plntll, indx)}
                                                title="Edit"
                                            >
                                                <FaRegEdit />
                                            </button>
                                            <button
                                                className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                onClick={() => handleDelete(Number(plntll.plantillID))}
                                                title="Delete"
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
    )
}
"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/JobPosition.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";

export default function JobPosition() {
    type jobPositionItem = {
        title: string;
        grade: string;
    }
  
    const [isEditing, setIsEditing] = useState(false);
    const [position, setposition] = useState<jobPositionItem[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const [title, setTitle] = useState("");
    const [grade, setGrade] = useState("");

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newJob = { title, grade };

        if(!isEditing) {
            setposition([...position, newJob]);
        } else {
            if (editIndex !== null) {
                const updatePositions = [...position];
                updatePositions[editIndex] = newJob;
                setposition(updatePositions);
                setIsEditing(false);
                setEditIndex(null);
            }
        }

        setTitle("");
        setGrade("");
    }

    const handleClear = () => {
        setTitle("");
        setGrade("");

        setIsEditing(false);
    };

    const handleDelete = (title: string) => {
        if(title) {
            setTitle("");
            setGrade("");
            setIsEditing(false);
        }
        const arr = position.filter(pos => pos.title != title);
        setposition(arr);
    };

    const handleEdit = (obj: { title: string; grade: string }, index: number) => {
        const {title, grade} = obj;

        setEditIndex(index);
        setTitle(title);
        setGrade(grade);

        setIsEditing(true);
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Job Position</h2>
                </div>

                <div className={modalStyles.modalBody}>
                    <div>
                        <form className={styles.JobPositionForm} onSubmit={onSubmit}>
                            <label>Position</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required={true}
                            />
                            <label>Salary Grade</label>
                            <input
                                type="text"
                                value={grade}
                                onChange={e => setGrade(e.target.value)}
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

                        {position.length > 0 && (
                            <div className={styles.JobPositionTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Position Title</th>
                                            <th>Salary Grade</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {position.map((pos, indx) => (
                                            <tr key={pos.title ?? `row-${indx}`}>
                                                <td>{pos.title}</td>
                                                <td>{pos.grade}</td>
                                                <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(pos, indx)}
                                                    title="Edit"
                                                >
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(pos.title)}
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
        </div>
    )
};
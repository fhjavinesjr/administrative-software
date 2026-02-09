"use client"

import React, { useState,useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/BusinessUnits.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function BusinessUnit() {
    type BusinessUnitEntry = {
        code: string;
        description: string;
    };

    type BusinessUnitEntryWithInput = BusinessUnitEntry & {
        inputValue: string;
    };

    const [inputValue, setInputValue] = useState("");
    const [selectBusinessUnit, setSelectBusinessUnit] = useState<BusinessUnitEntry | null>(null);
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [entry, setEntry] = useState<BusinessUnitEntryWithInput[]>([]);

    const units = [
        { code: 'HR', description: 'Human Resources' },
        { code: 'Admin', description: 'Administrative' },
        { code: 'Accounting', description: 'Accounting' },
    ];

    const handleClear = () => {
        setCode("");
        setDescription("");
        setInputValue("");
        setIsEditing(false);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: BusinessUnitEntryWithInput = { code, description, inputValue };

         if(!isEditing) {
            setEntry([...entry, newEntry]);

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

            handleClear();
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
                        const updateLeave = [...entry];
                        updateLeave[editIndex] = newEntry;
                        setEntry(updateLeave);
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

                        handleClear();
                    }
                })
            }
         }
    }

    useEffect(() => {
        if (selectBusinessUnit) {
            setCode(selectBusinessUnit.code);
            setDescription(selectBusinessUnit.description);
        }
    }, [selectBusinessUnit]);

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setDescription("");
            setInputValue("");
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
                const res = entry.filter(s => s.code != type);
                setEntry(res);
            }
        })
    };

    const handleEdit = (obj: BusinessUnitEntryWithInput, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setInputValue(obj.inputValue);
        setDescription(obj.description);
        setIsEditing(true);
    };

    return (
        <div className={modalStyles.Modal}>
             <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Business Units</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.BusinessUnitsForm} onSubmit={onSubmit}>
                        <label>Business Units</label>
                        <input
                        type="text"
                        list="business-units"
                        value={inputValue}
                        placeholder="Unit"
                        required={true}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            const selected = units.find(
                                (unit) =>
                                `${unit.description}`.toLowerCase() ==
                                e.target.value.toLowerCase()
                            );
                            setSelectBusinessUnit(selected || null);
                        }}/>
                        {(
                            <datalist id="business-units">
                                {units.map((unit) => (
                                <option
                                    key={unit.code}
                                    value={`${unit.code} - ${unit.description}`}
                                />
                                ))}
                            </datalist>
                        )}
                        <label>Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required={true}
                        />
                        <label>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
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
                    {entry.length > 0 && (
                        <div className={styles.BusinessUnitsTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Description</th>
                                        <th>Under</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entry.map((ent, indx) => (
                                        <tr key={ent.code ?? `row-${indx}`}>
                                            <td>{ent.code}</td>
                                            <td>{ent.description}</td>
                                            <td>{ent.inputValue}</td>
                                            <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(ent, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(ent.code)}
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
"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "@/styles/EarningType.module.scss";
import modalStyles from "@/styles/Modal.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";


export default function EarningTypes() {
    type EarningTypesEntry = {
        code: string;
        name: string;
        accountingCode:string;
        sequence: number;
        selectedEarnings: string[];
    };

    const [code, setCode] = useState("");
    const [accountingCode, setAccountingCode] = useState("");
    const [name, setName] = useState("");
    const [sequence, setSequence] = useState(0);

    const [isEditing, setIsEditing] = useState(false);
    const [arr, setArr] = useState<EarningTypesEntry[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [selectedEarnings, setSelectedEarnings] = useState<string[]>([]);

    const earnings = [
        "Taxable","Allowance","Daily Basis","Basic","RATA",
        "Honorarium","ECOLA","UP","Fixed Housing","Representation",
        "Transportation","Longivity","Laundy","Hazard Pay","PERA",
        "Subsistence","Special Payroll"
    ];

    const handleCheckboxChange = (value: string) => {
        setSelectedEarnings((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value]
        );
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: EarningTypesEntry = { accountingCode, code, name, sequence, selectedEarnings };

        if(!isEditing) {
            setArr([...arr, newEntry]);

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
            setName("");
            setSequence(0);
            setAccountingCode("");
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
                        const updateLeave = [...arr];
                        updateLeave[editIndex] = newEntry;
                        setArr(updateLeave);
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
                        setName("");
                        setSequence(0);
                        setAccountingCode("");
                    }
                })
            }
        }
    }

    const handleClear = () => {
        setCode("");
        setName("");
        setSequence(0);
        setAccountingCode("");
        setIsEditing(false);
    };

    const handleDelete = (type: string) => {
        if(code) {
            setCode("");
            setName("");
            setSequence(0);
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
                const res = arr.filter(s => s.name != type);
                setArr(res);
            }
        })
    }

    const handleEdit = (obj: EarningTypesEntry, index: number) => {
        setEditIndex(index);
        setCode(obj.code);
        setName(obj.name);
        setAccountingCode(obj.accountingCode);
        setSequence(obj.sequence);
        setIsEditing(true);
    };

    useEffect(() => {
        if (sequence < 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Sequence",
                text: "Sequence number must be greater than 0.",
                confirmButtonText: "OK"
            });

            setSequence(0);
        }
    }, [sequence]);

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>HR Earning Types</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.EarningTypeForm} onSubmit={onSubmit}>
                        <label>Accounting Code</label>
                        <input
                            type="text"
                            value={accountingCode}
                            onChange={(e) => setAccountingCode(e.target.value)}
                            required
                        />
                        <label>Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <label>Sequence No.</label>
                        <input
                            type="number"
                            value={sequence}
                            onChange={(e) => setSequence(Number(e.target.value))}
                            required
                        />
                    
                        <div className={styles.checkboxGroup}>
                            {earnings.map((item, index) => (
                                <div key={index} className={styles.checkboxItem}>
                                    <label>{item}:</label>
                                    <input
                                        type="checkbox"
                                        checked={selectedEarnings.includes(item)}
                                        onChange={() => handleCheckboxChange(item)}
                                    />
                                </div>
                            ))}
                        </div>
                       
                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={isEditing ? styles.updateButton : styles.saveButton}>
                                {isEditing ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClear}>
                                Clear
                            </button>
                        </div>
                    </form>

                    {arr.length > 0 && (
                        <div className={styles.EarningTypeTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Accounting Code</th>
                                        <th>Code</th>
                                        <th>Earning Type</th>
                                        <th>Sequence</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {arr.map((m, indx) => (
                                        <tr key={m.code ?? `row-${indx}`}>
                                            <td>{m.accountingCode}</td>
                                            <td>{m.code}</td>
                                            <td>{m.name}</td>
                                            <td>{m.sequence}</td>
                                             <td>
                                                <button
                                                    className={`${styles.iconButton} ${styles.editIcon}`}
                                                    onClick={() => handleEdit(m, indx)}
                                                    title="Edit">
                                                    <FaRegEdit />
                                                </button>
                                                <button
                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                    onClick={() => handleDelete(m.name)}
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
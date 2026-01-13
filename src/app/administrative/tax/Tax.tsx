"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Tax.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Tax() {
    type BaseEntry = {
        indexNo: string;
        fixed: string;
        percentage: string;
        amount: string;
    };

    type DailyEntry = BaseEntry & {
        salaryType: "Daily";
    };

    type WeeklyEntry = BaseEntry & {
        salaryType: "Weekly";
    };

    type SemiMonthly = BaseEntry & {
        salaryType: "Semi-Monthly";
    };

    type MonthlyEntry = BaseEntry & {
        salaryType: "Monthly";
    };

    type SalaryEntry = DailyEntry | WeeklyEntry | SemiMonthly | MonthlyEntry;

    const [salaryType, setSalaryType] = useState("Monthly");
    const [fixed, setFixed] = useState("");
    const [indexNo, setIndexNo] = useState("1");
    const [percentage, setPercentage] = useState("");
    const [daily, setDaily] = useState<SalaryEntry[]>([]);
    const [monthly, setMonthly] = useState<SalaryEntry[]>([]);
    const [weekly, setWeekly] = useState<SalaryEntry[]>([]);
    const [semiMonthly, setSemiMonthly] = useState<SalaryEntry[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [amount, setAmount] = useState("");

    const indexExists = (list: SalaryEntry[], indexNo: string) => {
        return list.some(item => item.indexNo === indexNo);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let newEntry: SalaryEntry;

        switch (salaryType) {
            case "Daily":
                newEntry = {
                    salaryType: "Daily",
                    indexNo,
                    fixed,
                    percentage,
                    amount
                };
                break;

            case "Weekly":
                newEntry = {
                    salaryType: "Weekly",
                    indexNo,
                    fixed,
                    percentage,
                    amount
                };
                break;
            
            case "Semi-Monthly":
                newEntry = {
                    salaryType: "Semi-Monthly",
                    indexNo,
                    fixed,
                    percentage,
                    amount
                };
                break;

            default:
                newEntry = {
                    salaryType: "Monthly",
                    indexNo,
                    fixed,
                    percentage,
                    amount
                };
            break;
        }

        if(!isEditing) {
            let targetList: SalaryEntry[] = [];

            if (salaryType == "Daily") targetList = daily;
            if (salaryType == "Weekly") targetList = weekly;
            if (salaryType == "Semi-Monthly") targetList = semiMonthly;
            if (salaryType == "Monthly") targetList = monthly;

            if (indexExists(targetList, indexNo)) {
      
                Swal.fire({
                    icon: "error",
                    title: "Duplicate Index No",
                    text: `Index No. ${indexNo} already exists for ${salaryType}.`,
                });
                return;
            }

            if (salaryType == "Daily") setDaily([...daily, newEntry]);
            if (salaryType == "Weekly") setWeekly([...weekly, newEntry]);
            if (salaryType == "Semi-Monthly") setSemiMonthly([...semiMonthly, newEntry]);
            if (salaryType == "Monthly") setMonthly([...monthly, newEntry]);
  
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
                        const updateSalType = salaryType == 'Daily' ? [...daily]
                                            : salaryType == 'Weekly' ? [...weekly]
                                            : salaryType == 'Semi-Monthly' ? [...semiMonthly]
                                            : [...monthly];

                        updateSalType[editIndex] = newEntry;

                        if (salaryType == "Daily") setDaily(updateSalType);
                        if (salaryType == "Weekly") setWeekly(updateSalType);
                        if (salaryType == "Semi-Monthly") setSemiMonthly(updateSalType);
                        if (salaryType == "Monthly") setMonthly(updateSalType);

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
    };

    const handleClear = () => {
        setSalaryType("Daily");
        setFixed("");
        setIndexNo("1");
        setPercentage("");
        setAmount("");
        setIsEditing(false);
    };

    const handleEdit = (obj: SalaryEntry, index: number) => {
        setEditIndex(index);
        setSalaryType(obj.salaryType);
        setIndexNo(obj.indexNo);
        setFixed(obj.fixed);
        setPercentage(obj.percentage);
        setAmount(obj.amount);
        setIsEditing(true);
    };

    const handleDelete = (obj: SalaryEntry, indx: number) => {
        if(indexNo) {
            handleClear();
            setSalaryType("Daily");
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
                if (obj.salaryType == "Daily") setDaily(prev => prev.filter((_, i) => i != indx));
                if (obj.salaryType == "Weekly") setWeekly(prev => prev.filter((_, i) => i != indx));
                if (obj.salaryType == "Semi-Monthly") setSemiMonthly(prev => prev.filter((_, i) => i != indx));
                if (obj.salaryType == "Monthly") setMonthly(prev => prev.filter((_, i) => i != indx));
            }
        })
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>With-Holding Tax Table</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.TaxForm}  onSubmit={onSubmit}>
                        <label>Salary Type</label>
                        <select
                            value={salaryType}
                            onChange={(e) => setSalaryType(e.target.value)}>
                                <option value="Monthly">Monthly</option>
                                <option value="Semi-Monthly">Semi-Monthly</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Daily">Daily</option>
                        </select>
                        <label>Index No.</label>
                        <select
                            className={styles.indexNo}
                            value={indexNo}
                            required
                            onChange={(e) => setIndexNo(e.target.value)}>
                                {Array.from({ length: 20 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                        </select>
                        <label>Fixed Amount</label>
                        <input
                            className={styles.date}
                            type="text"
                            value={fixed}
                            onChange={e => setFixed(e.target.value)}
                            required={true}
                        />
                        <label>Percentage Over Base</label>
                         <input
                            className={styles.date}
                            type="text"
                            value={percentage}
                            onChange={e => setPercentage(e.target.value)}
                            required={true}
                        />
                        <label>Amount</label>
                         <input
                            className={styles.date}
                            type="text"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required={true}
                        />
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={isEditing ? styles.updateButton : styles.saveButton}>
                                {isEditing ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className={styles.clearButton}>
                                Clear
                            </button>
                        </div>
                    </form>

                    {monthly.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES MONTHLY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {monthly.map((m) => (
                                            <th key={m.indexNo}>{m.indexNo}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{monthly[0]?.salaryType}</td>
                                            {monthly.map((m, mindx) => (
                                            <td key={m.indexNo}>
                                                <span>{m.fixed}</span>
                                                <p>+ {m.percentage} Over</p>
                                                <p>{m.amount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m, mindx)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m, mindx)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {semiMonthly.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES SEMI-MONTHLY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {semiMonthly.map((m) => (
                                            <th key={m.indexNo}>{m.indexNo}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{semiMonthly[0]?.salaryType}</td>
                                            {semiMonthly.map((m, mindx) => (
                                            <td key={m.indexNo}>
                                                <span>{m.fixed}</span>
                                                <p>+ {m.percentage} Over</p>
                                                <p>{m.amount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m, mindx)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m, mindx)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {weekly.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES WEEKLY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {weekly.map((m) => (
                                            <th key={m.indexNo}>{m.indexNo}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{weekly[0]?.salaryType}</td>
                                            {weekly.map((m, mindx) => (
                                            <td key={m.indexNo}>
                                                <span>{m.fixed}</span>
                                                <p>+ {m.percentage} Over</p>
                                                <p>{m.amount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m, mindx)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m, mindx)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {daily.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>TAX TABLE ENTRIES DAILY</h4>
                            <div className={styles.TaxTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Salary Type</th>
                                            {daily.map((m) => (
                                            <th key={m.indexNo}>{m.indexNo}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td>{daily[0]?.salaryType}</td>
                                            {daily.map((m, mindx) => (
                                            <td key={m.indexNo}>
                                                <span>{m.fixed}</span>
                                                <p>+ {m.percentage} Over</p>
                                                <p>{m.amount}</p>
                                                <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(m, mindx)}
                                                        title="Edit">
                                                        <FaRegEdit />
                                                    </button>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(m, mindx)}
                                                        title="Delete">
                                                        <FaTrashAlt />
                                                    </button>
                                            </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
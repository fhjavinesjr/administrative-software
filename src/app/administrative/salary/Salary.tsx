"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Salary.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Salary() {
    type SalaryEntry = {
        salaryType: string;
        startDay: string;
        endDay: string;
        salaryStart: string;
        salaryEnd: string;
    };
    const days1to31 = Array.from({ length: 31 }, (_, i) => i + 1);
    const [payrollEntry, setPayrollEntry] = useState<SalaryEntry[]>([]);
    const [leaveEntry, setLeaveEntry] = useState<SalaryEntry[]>([]);
    const [activeTab, setActiveTab] = useState<"payroll" | "leave">("payroll");
    const [salaryType, setSalaryType] = useState("Monthly");
    const [startDay, setStartDay] = useState("1");
    const [endDay, setEndDay] = useState("31");
    const [salaryStart, setSalaryStart] = useState("1");
    const [salaryEnd, setSalaryEnd] = useState("31");
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null)
    const [cuttOffStartMonth, setCuttOffStartMonth] = useState("Previous Month");
    const [cutOffEndMonth, setCutOffEndMonth] = useState("Current Month");

    const DEFAULT_SALARY_TYPE = "Monthly";
    const DEFAULT_START_DAY = "1";
    const DEFAULT_END_DAY = "31";
    const DEFAULT_SALARY_START = "1";
    const DEFAULT_SALARY_END = "31";

    const resetForm = () => {
        setSalaryType(DEFAULT_SALARY_TYPE);
        setStartDay(DEFAULT_START_DAY);
        setEndDay(DEFAULT_END_DAY);
        setSalaryStart(DEFAULT_SALARY_START);
        setSalaryEnd(DEFAULT_SALARY_END);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: SalaryEntry = { salaryType, startDay, endDay, salaryStart, salaryEnd}
        
        if(!isEditing) {
            if(activeTab == 'payroll') {
                setPayrollEntry([...payrollEntry, newEntry])
            } 
            if(activeTab == 'leave') {
                setLeaveEntry([...leaveEntry, newEntry])
            }

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

            resetForm();
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
                        const updateLeave = activeTab == 'payroll' ? [...payrollEntry] : [...leaveEntry];
                        updateLeave[editIndex] = newEntry;
                        
                        if(activeTab == 'payroll') {
                            setPayrollEntry(updateLeave);
                        } else {
                            setLeaveEntry(updateLeave);
                        }

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
                        resetForm();
                    }
                })
            }
        }
    }

    const handleEdit = (obj: SalaryEntry, index: number) => {
        setEditIndex(index);
        setSalaryType(obj.salaryType);
        setStartDay(obj.startDay);
        setEndDay(obj.endDay);
        setSalaryStart(obj.salaryStart);
        setSalaryEnd(obj.salaryEnd);
        setIsEditing(true);
    };

    const handleClear = () => {
        resetForm();
        setIsEditing(false);
    };

    const handleDelete = (indx: number) => {
        if(salaryType) {
            resetForm();
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
                if(activeTab == 'payroll') {
                    setPayrollEntry(prev => prev.filter((_, i) => i != indx));
                } else {
                    setLeaveEntry(prev => prev.filter((_, i) => i != indx));
                }
                
            }
        })
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Salary Period</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <div className={styles.periodType}>
                        <div className={styles.tabsHeader}>
                            <button className={`${styles.tabButton} ${activeTab === "payroll" ? styles.active : ""}`} onClick={() => setActiveTab("payroll")}>
                                Payroll
                            </button>
                            <button className={`${styles.tabButton} ${ activeTab === "leave" ? styles.active : ""}`} onClick={() => setActiveTab("leave")}>
                                Leave Process
                            </button>
                        </div>
                    </div>
                    <form className={styles.SalaryForm} onSubmit={onSubmit}>
                        <label className={styles.empLabel}>Salary Type</label>
                        <select
                            value={salaryType}
                            onChange={(e) => setSalaryType(e.target.value)}>
                                <option value="Monthly">Monthly</option>
                                <option value="Semi-Monthly">Semi-Monthly</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Daily">Daily</option>
                        </select>
                        <label className={styles.empLabel}>Order</label>
                        <select
                            className={styles.cutOffFrom}
                            value={salaryType}
                            onChange={(e) => setSalaryType(e.target.value)}>
                                <option value="1st">1st</option>
                        </select>
                        <label className={styles.empLabel}>Cut-Off Start From</label>
                        <select
                            className={styles.cutOffFrom}
                            value={startDay}
                            onChange={(e) => setStartDay(e.target.value)}>
                                {days1to31.map(day => (
                                    <option key={day} value={day}>
                                    {day}
                                    </option>
                                ))}
                        </select>
                        <select
                            className={styles.cutOffFromMonth}
                            value={cuttOffStartMonth}
                            onChange={(e) => setCuttOffStartMonth(e.target.value)}>
                                <option value="previous month">Previous Month</option>
                                <option value="current month">Current Month</option>
                        </select>
                        <label className={styles.empLabel}>Cut-Off End At</label>
                        <select
                            className={styles.cutOffFrom}
                            value={endDay}
                            onChange={(e) => setEndDay(e.target.value)}>
                                {days1to31.map(day => (
                                    <option key={day} value={day}>
                                    {day}
                                    </option>
                                ))}
                        </select>
                        <select
                            className={styles.cutOffFromMonth}
                            value={cutOffEndMonth}
                            onChange={(e) => setCutOffEndMonth(e.target.value)}>
                                <option value="previous month">Previous Month</option>
                                <option value="current month">Current Month</option>
                        </select>
                        <label className={styles.empLabel}>Salary Start From</label>
                        <select
                            className={styles.cutOffFrom}
                            value={salaryStart}
                            onChange={(e) => setSalaryStart(e.target.value)}>
                                {days1to31.map(day => (
                                    <option key={day} value={day}>
                                    {day}
                                    </option>
                                ))}
                        </select>
                        <label className={styles.empLabel}>Salary End At</label>
                        <select
                            className={styles.cutOffFrom}
                            value={salaryEnd}
                            onChange={(e) => setSalaryEnd(e.target.value)}>
                                {days1to31.map(day => (
                                    <option key={day} value={day}>
                                    {day}
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
                                onClick={handleClear}>
                                Clear
                            </button>
                        </div>
                    </form>
                    <div className={styles.tableWrapper} key={activeTab}>
                        {activeTab == 'payroll' && payrollEntry.length > 0 && (
                        <div className={styles.tableFade} key="payroll">
                                <h4 className={styles.tableHeader}>LIST OF SALARY PERIOD(PAYROLL) SETTING</h4>
                                <div className={styles.SalaryTable}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Salary Type</th>
                                                <th>Cutt-Off Start</th>
                                                <th>Cut-Off End</th>
                                                <th>Salary Start</th>
                                                <th>Salary End</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payrollEntry.map((pay, indx) => (
                                                <tr key={pay.startDay ?? `row-${indx}`}>
                                                    <td>{pay.salaryType}</td>
                                                    <td>{pay.startDay}</td>
                                                    <td>{pay.endDay}</td>
                                                    <td>{pay.salaryStart}</td>
                                                    <td>{pay.salaryEnd}</td>
                                                    <td>
                                                        <button
                                                            className={`${styles.iconButton} ${styles.editIcon}`}
                                                            onClick={() => handleEdit(pay, indx)}
                                                            title="Edit">
                                                            <FaRegEdit />
                                                        </button>
                                                        <button
                                                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                            onClick={() => handleDelete(indx)}
                                                            title="Delete">
                                                            <FaTrashAlt />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                        </div>
                        )}

                        {activeTab == 'leave' && leaveEntry.length > 0 && (
                            <div className={styles.tableFade} key="leave">
                                <h4 className={styles.tableHeader}>LIST OF SALARY PERIOD(LEAVE) SETTING</h4>
                                <div className={styles.SalaryTable}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Salary Type</th>
                                                <th>Cutt-Off Start</th>
                                                <th>Cut-Off End</th>
                                                <th>Salary Start</th>
                                                <th>Salary End</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaveEntry.map((pay, indx) => (
                                                <tr key={pay.startDay ?? `row-${indx}`}>
                                                    <td>{pay.salaryType}</td>
                                                    <td>{pay.startDay}</td>
                                                    <td>{pay.endDay}</td>
                                                    <td>{pay.salaryStart}</td>
                                                    <td>{pay.salaryEnd}</td>
                                                    <td>
                                                        <button
                                                            className={`${styles.iconButton} ${styles.editIcon}`}
                                                            onClick={() => handleEdit(pay, indx)}
                                                            title="Edit">
                                                            <FaRegEdit />
                                                        </button>
                                                        <button
                                                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                            onClick={() => handleDelete(indx)}
                                                            title="Delete">
                                                            <FaTrashAlt />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
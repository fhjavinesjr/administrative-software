"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/PhilHealth.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

export default function PhilHealth() {
    type PhilHealtEntry = {
        date: string;
        rate: string;
        monthlyRange: string;
        monthlyRangeTo: string;
        personal: string;
        personalTo: string;
        employer: string;
        employerTo: string;
        totalPremium: string;
        totalPremiumTo: string;
        above: boolean;
        [key: string]: string | boolean;
        
    };

    const [date, setDate] = useState("");
    const [rate, setRate] = useState("");
    const [percentageOf, setPercentageOf] = useState("");
    const [monthlyRange, setMonthlyRange] = useState("");
    const [monthlyRangeTo, setMonthlyRangeTo] = useState("");
    const [above, setAbove] = useState(false);
    const [personal, setPersonal] = useState("");
    const [personalTo] = useState("0.0");
    const [employer, setEmployer] = useState("");
    const [employerTo] = useState("0.0");
    const [totalPremium, setTotalPremium] = useState("");
    const [totalPremiumTo] = useState("0.0");
    const [isEditing, setIsEditing] = useState(false);
    const [entry, setEntry] = useState<PhilHealtEntry[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null)

    useEffect(() => {
    const personalValue = parseFloat(personal) || 0;
    const employerValue = parseFloat(employer) || 0;

    const total = personalValue + employerValue;

    setTotalPremium(total.toFixed(2)); 
    }, [personal, employer]);

    const formatNumber = (value: string) => {
        const num = parseFloat(value.replace(/,/g, "")); // remove commas first
        if (isNaN(num)) return "";
        return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: PhilHealtEntry = { date, rate, monthlyRange, monthlyRangeTo, personal, personalTo, employer, employerTo, totalPremium, totalPremiumTo, above,
            range: `${monthlyRange} - ${monthlyRangeTo}`,
            per: `${personal} - ${personalTo}`,
            emp: `${employer} - ${employerTo}`,
            prem: `${totalPremium} - ${totalPremiumTo}`,
        };
        // (newEntry as any)['range'] = `${newEntry.monthlyRange} - ${newEntry.monthlyRangeTo}`;
        // (newEntry as any)['per'] = `${newEntry.personal} - ${newEntry.personalTo}`;
        // (newEntry as any)['emp'] = `${newEntry.employer} - ${newEntry.employerTo}`;
        // (newEntry as any)['prem']  = `${newEntry.totalPremium} - ${newEntry.totalPremiumTo}`;
       
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
                title: "Successfully Created!"
            });

            handleClear();
            setTotalPremium("");
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
    };

    const handleClear = () => {
        setDate("");
        setRate("");
        setMonthlyRange("");
        setMonthlyRangeTo("");
        setPersonal("");
        setEmployer("");
        setTotalPremium("");
        setIsEditing(false);
        setAbove(false);
    };

    const handleDelete = (indx: number) => {
        if(date) {
            handleClear();
            setTotalPremium("");
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
                setEntry(prev => prev.filter((_, i) => i != indx));
            }
        })
    };

    const handleEdit = (obj: PhilHealtEntry, index: number) => {
        setEditIndex(index);
        setDate(obj.date);
        setRate(obj.rate);
        setMonthlyRange(obj.monthlyRange);
        setMonthlyRangeTo(obj.monthlyRangeTo);
        setPersonal(obj.personal);
        setEmployer(obj.employer);
        setTotalPremium(obj.totalPremium);
        setAbove(obj.above);
        setIsEditing(true);
    };

    return (
        <div className={modalStyles.Modal}>
             <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>PhilHealth Contribution Table</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.PhilHealthForm} onSubmit={onSubmit}>
                        <label>Effectivity Date</label>
                        <input
                            className={styles.date}
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required={true}
                        />
                        <label>Rate</label>
                        <input
                            type="text"
                            value={rate}
                            onChange={e => setRate(e.target.value)}
                            required={true}
                        />
                        <span className={styles.percent}>%</span>
                        <select
                            value={percentageOf}
                            onChange={(e) => setPercentageOf(e.target.value)}>
                                <option value="Percentage of">Percentage of</option>
                                <option value="Fixed Amount">Fixed Amount</option>
                        </select>
                        
                        <label>Monthly Salary Range</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={monthlyRange}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/,/g, "");
                                if (!isNaN(Number(rawValue)) || rawValue === "") {
                                    setMonthlyRange(rawValue); 
                                }
                            }}
                            onBlur={e => setMonthlyRange(formatNumber(e.target.value))}
                            required={true}/>
                        <span className={styles.to}>To</span>

                        <div className={styles.inlineGroup}>
                            <input
                                className={styles.rate}
                                type="text"
                                value={monthlyRangeTo}
                                onChange={e => {
                                    const rawValue = e.target.value.replace(/,/g, "");
                                    if (!isNaN(Number(rawValue)) || rawValue === "") {
                                        setMonthlyRangeTo(rawValue); 
                                    }
                                }}
                                onBlur={e => setMonthlyRangeTo(formatNumber(e.target.value))}
                                required={true}
                            />
                            <label className={styles.aboveCheckbox}>
                                <input
                                    className={styles.checkbox}
                                    type="checkbox"
                                    checked={above}
                                    onChange={(e) => setAbove(e.target.checked)}
                                />
                                <span className={styles.check}>Please Check if &quot;Above&quot;</span>
                            </label>
                        </div>
                        
                        <label>Personal Share</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={personal}
                            onChange={e => setPersonal(e.target.value)}
                            required={true}
                        />
                        <span className={styles.to}>To</span>
                        <input
                            className={styles.rate}
                            type="text"
                            value={personalTo}
                            required={true}
                        />
                        <span className={styles.note}>[(Monthly Basic Salary * rate) / 2]</span>
                        <label>Employer Share</label>
                            <input
                            className={styles.rate}
                            type="text"
                            value={employer}
                            onChange={e => setEmployer(e.target.value)}
                            required={true}
                        />
                        <span className={styles.to}>To</span>
                        <input
                            className={styles.rate}
                            type="text"
                            value={employerTo}
                            required={true}
                        />
                        <span className={styles.note}>(PS = ES)</span>
                        <label>Total Monthly Premium</label>
                            <input
                            className={styles.rate}
                            type="text"
                            value={totalPremium}
                            onChange={e => setTotalPremium(e.target.value)}
                            required={true}
                        />
                        <span className={styles.to}>To</span>
                        <input
                            className={styles.rate}
                            type="text"
                            value={totalPremiumTo}
                            required={true}
                        />
                        <span className={styles.note}>(Monthly Basic Salary * rate)</span>
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
                    {entry.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>PHILHEALTHSCHEDULE OF CONTRIBUTIONS FOR EMPLOYED MEMBERS EFFECTIVE &quot;SET DATE&quot;</h4>
                            <div className={styles.PhilHealthTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Effectivity Date</th>
                                            <th>Monthly Salary Range</th>
                                            <th>Rate</th>
                                            <th>Total Monthly Premium Contribution</th>
                                            <th>Personal Share (PS)</th>
                                            <th>Employer Share (ES)</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.map((ent, indx) => (
                                            <tr key={ent.date ?? `row-${indx}`}>
                                                <td>{ent.date}</td>
                                                <td>{ent.range}</td>
                                                <td>{ent.rate}</td>
                                                <td>{ent.prem}</td>
                                                <td>{ent.per}</td>
                                                <td>{ent.emp}</td>
                                                <td>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                         onClick={() => handleEdit(ent, indx)}
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
    )
}
"use client";

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/PhilHealth.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function PhilHealth() {
    type PhilHealthContributionItem = {
        philhealthContributionId: number;
        effectivityDate: string;
        ratePercentage: string;
        monthlySalaryRangeFrom: string;
        monthlySalaryRangeTo: string;
        personalShareFrom: string;
        personalShareTo: string;
        employerShareFrom: string;
        employerShareTo: string;
    };

    const [philHealthData, setPhilHealthData] = useState<PhilHealthContributionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [effectivityDate, setEffectivityDate] = useState("");
    const [ratePercentage, setRatePercentage] = useState("");
    const [monthlySalaryRangeFrom, setMonthlySalaryRangeFrom] = useState("");
    const [monthlySalaryRangeTo, setMonthlySalaryRangeTo] = useState("");
    const [personalShareFrom, setPersonalShareFrom] = useState("");
    const [personalShareTo, setPersonalShareTo] = useState("");
    const [employerShareFrom, setEmployerShareFrom] = useState("");
    const [employerShareTo, setEmployerShareTo] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // LOAD DATA
    useEffect(() => {
        loadPhilHealthData();
    }, []);

    const loadPhilHealthData = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/philHealthContribution/get-all`
            );
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setPhilHealthData(data);
        } catch (err) {
            console.error("Failed to load PhilHealth data:", err);
            Swal.fire("Error", "Failed to load PhilHealth contribution data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (value: string) => {
        const num = parseFloat(value.replace(/,/g, ""));
        if (isNaN(num)) return "";
        return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // SAVE + UPDATE
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!effectivityDate || !ratePercentage || !monthlySalaryRangeFrom || !monthlySalaryRangeTo ||
            !personalShareFrom || !personalShareTo || !employerShareFrom || !employerShareTo) {
            Swal.fire("Validation Error", "All fields are required.", "warning");
            return;
        }

        const payload = {
            effectivityDate: toCustomFormat(effectivityDate, true),
            ratePercentage,
            monthlySalaryRangeFrom,
            monthlySalaryRangeTo,
            personalShareFrom,
            personalShareTo,
            employerShareFrom,
            employerShareTo,
        };

        try {
            if (!isEditing) {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/philHealthContribution/create`,
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
                    text: "PhilHealth Contribution created successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/philHealthContribution/update/${editId}`,
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
                    text: "PhilHealth Contribution updated successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                setIsEditing(false);
                setEditId(null);
            }

            await loadPhilHealthData();
            handleClear();
        } catch (err) {
            console.error("Save failed:", err);
            Swal.fire("Error", "Failed to save record.", "error");
        }
    };

    // EDIT BUTTON
    const handleEdit = (obj: PhilHealthContributionItem) => {
        setEditId(obj.philhealthContributionId);
        setEffectivityDate(toDateInputValue(obj.effectivityDate));
        setRatePercentage(obj.ratePercentage);
        setMonthlySalaryRangeFrom(obj.monthlySalaryRangeFrom);
        setMonthlySalaryRangeTo(obj.monthlySalaryRangeTo);
        setPersonalShareFrom(obj.personalShareFrom);
        setPersonalShareTo(obj.personalShareTo);
        setEmployerShareFrom(obj.employerShareFrom);
        setEmployerShareTo(obj.employerShareTo);
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
                `${API_BASE_URL_ADMINISTRATIVE}/api/philHealthContribution/delete/${id}`,
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

            await loadPhilHealthData();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to delete record.", "error");
        }
    };

    const handleClear = () => {
        setEffectivityDate("");
        setRatePercentage("");
        setMonthlySalaryRangeFrom("");
        setMonthlySalaryRangeTo("");
        setPersonalShareFrom("");
        setPersonalShareTo("");
        setEmployerShareFrom("");
        setEmployerShareTo("");
        setIsEditing(false);
        setEditId(null);
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
                            value={effectivityDate}
                            onChange={e => setEffectivityDate(e.target.value)}
                            required
                        />

                        <label>Rate (%)</label>
                        <input
                            type="text"
                            value={ratePercentage}
                            onChange={e => setRatePercentage(e.target.value)}
                            required
                        />

                        <label>Monthly Salary Range From</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={monthlySalaryRangeFrom}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/,/g, "");
                                if (!isNaN(Number(rawValue)) || rawValue === "") {
                                    setMonthlySalaryRangeFrom(rawValue);
                                }
                            }}
                            onBlur={e => setMonthlySalaryRangeFrom(formatNumber(e.target.value))}
                            required
                        />

                        <label>Monthly Salary Range To</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={monthlySalaryRangeTo}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/,/g, "");
                                if (!isNaN(Number(rawValue)) || rawValue === "") {
                                    setMonthlySalaryRangeTo(rawValue);
                                }
                            }}
                            onBlur={e => setMonthlySalaryRangeTo(formatNumber(e.target.value))}
                            required
                        />

                        <label>Personal Share From</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={personalShareFrom}
                            onChange={e => setPersonalShareFrom(e.target.value)}
                            required
                        />

                        <label>Personal Share To</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={personalShareTo}
                            onChange={e => setPersonalShareTo(e.target.value)}
                            required
                        />

                        <label>Employer Share From</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={employerShareFrom}
                            onChange={e => setEmployerShareFrom(e.target.value)}
                            required
                        />

                        <label>Employer Share To</label>
                        <input
                            className={styles.rate}
                            type="text"
                            value={employerShareTo}
                            onChange={e => setEmployerShareTo(e.target.value)}
                            required
                        />

                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={isEditing ? styles.updateButton : styles.saveButton}
                                disabled={loading}
                            >
                                {isEditing ? "Update" : "Save"}
                            </button>

                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClear}
                                disabled={loading}
                            >
                                Clear
                            </button>
                        </div>
                    </form>

                    {philHealthData.length > 0 && (
                        <div>
                            <h4 className={styles.tableHeader}>PHILHEALTH SCHEDULE OF CONTRIBUTIONS FOR EMPLOYED MEMBERS</h4>
                            <div className={styles.PhilHealthTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Effectivity Date</th>
                                            <th>Monthly Salary Range</th>
                                            <th>Rate (%)</th>
                                            <th>Personal Share</th>
                                            <th>Employer Share</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {philHealthData.map((item) => (
                                            <tr key={item.philhealthContributionId}>
                                                <td>{item.effectivityDate}</td>
                                                <td>{item.monthlySalaryRangeFrom} - {item.monthlySalaryRangeTo}</td>
                                                <td>{item.ratePercentage}</td>
                                                <td>{item.personalShareFrom} - {item.personalShareTo}</td>
                                                <td>{item.employerShareFrom} - {item.employerShareTo}</td>
                                                <td>
                                                    <button
                                                        className={`${styles.iconButton} ${styles.editIcon}`}
                                                        onClick={() => handleEdit(item)}
                                                        title="Edit"
                                                        disabled={loading}
                                                    >
                                                        <FaRegEdit />
                                                    </button>

                                                    <button
                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                        onClick={() => handleDelete(item.philhealthContributionId)}
                                                        title="Delete"
                                                        disabled={loading}
                                                    >
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
    );
}
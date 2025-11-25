"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/Plantilla.module.scss";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function Plantilla() {
    type PlantillaAPI = {
        plantillaId: number;
        plantillaName: string;
        jobPositionId: number;
    };

    type JobPositionItem = {
        jobPositionId: number;
        jobPositionName: string;
        salaryGrade: string;
        salaryStep: string;
    };

    type PlantillaItem = {
        plantillID: string;
        itemNo: string;
        position: string;
        grade: string;
        step: string;
    }

    const [plantilla, setPlantilla] = useState<PlantillaItem[]>([]);
    const [jobPositions, setJobPositions] = useState<JobPositionItem[]>([]);

    const [plantillaID, setPlantillaID] = useState("");
    const [itemNo, setItemNo] = useState("");
    const [position, setPosition] = useState("");
    const [grade, setGrade] = useState("");
    const [step, setStep] = useState("");

    const [isEditing, setIsEditing] = useState(false);

    const [plantillaRaw, setPlantillaRaw] = useState<PlantillaAPI[]>([]);

    const [selectedPlantillaId, setSelectedPlantillaId] = useState<number | null>(null);
    const [selectedJobPositionId, setSelectedJobPositionId] = useState<number | null>(null);

    useEffect(() => {
        const loadPlantilla = async () => {
            try {
                const res = await fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/plantilla/get-all`);
                if (!res.ok) throw new Error(await res.text());
                const data = await res.json();
                setPlantillaRaw(data);  // <-- NEW temporary state
            } catch (err) {
                console.error("Failed to load plantilla:", err);
            }
        };
        loadPlantilla();
    }, []);

    useEffect(() => {
        if (jobPositions.length === 0 || plantillaRaw.length === 0) return;

        const formatted = plantillaRaw.map((p) => {
            const job = jobPositions.find(j => j.jobPositionId === p.jobPositionId);

            return {
                plantillID: p.plantillaId.toString(),
                itemNo: p.plantillaName,
                position: job ? job.jobPositionName : "",
                grade: job ? job.salaryGrade : "",
                step: job ? job.salaryStep : "",
            };
        });

        setPlantilla(formatted);

    }, [jobPositions, plantillaRaw]);

    // 🔵 FETCH JOB POSITIONS FROM BACKEND
    useEffect(() => {
        const loadJobPositions = async () => {
        try {
            const res = await fetchWithAuth(
            `${API_BASE_URL_ADMINISTRATIVE}/api/job-position/get-all`
            );
            if (!res.ok) throw new Error(await res.text());

            const data = (await res.json()) as JobPositionItem[];

            const sorted = data.sort((a, b) =>
            a.jobPositionName.localeCompare(b.jobPositionName)
            );

            setJobPositions(sorted);
        } catch (err) {
            console.error("Failed to load job positions:", err);
        }
        };

        loadJobPositions();
    }, []);

    // 🔵 AUTO-FILL GRADE WHEN POSITION SELECTED
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;
        setPosition(selectedName);

        const found = jobPositions.find(
        (p) => p.jobPositionName === selectedName
        );

        if (found) {
            setSelectedJobPositionId(found.jobPositionId);
            setGrade(found.salaryGrade); // salary grade only
            setStep(found.salaryStep); // salary step only
        } else {
            setPlantillaID("");
            setGrade("");
            setStep("");
        }
    };

    // FORM SUBMIT
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            plantillaName: itemNo,
            jobPositionId: Number(selectedJobPositionId),
        };

        try {
            if (!isEditing) {
                // CREATE
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/plantilla/create`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) throw new Error(await res.text());
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Plantilla saved successfully!",
                    timer: 1500,
                    showConfirmButton: false
                });

            } else {
                // UPDATE
                const res = await fetchWithAuth(
                    `${API_BASE_URL_ADMINISTRATIVE}/api/plantilla/update/${selectedPlantillaId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );

                if (!res.ok) throw new Error(await res.text());
                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: "Plantilla updated successfully!",
                    timer: 1500,
                    showConfirmButton: false
                });

                setIsEditing(false);
            }

            // REFRESH DATA
            const refresh = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/plantilla/get-all`
            );
            const list = await refresh.json();
            setPlantilla(
                list.map((p: PlantillaAPI) => {
                    const job = jobPositions.find(j => j.jobPositionId === p.jobPositionId);

                    return {
                        plantillID: p.plantillaId.toString(),
                        itemNo: p.plantillaName,
                        position: job ? job.jobPositionName : "",
                        grade: job ? job.salaryGrade : "",
                        step: job ? job.salaryStep : "",
                    };
                })
            );

            // CLEAR FIELDS
            setItemNo("");
            setPosition("");
            setGrade("");
            setStep("");

        } catch (err) {
            console.error("Error saving plantilla:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to save plantilla. Please try again.",
            });
        }
    };

    // EDIT BUTTON
    const handleEdit = (obj: PlantillaItem) => {
        // 1. plantillaId from table
        setSelectedPlantillaId(Number(obj.plantillID));

        // 2. Find jobPositionId from position name
        const job = jobPositions.find(j => j.jobPositionName === obj.position);
        setSelectedJobPositionId(job ? job.jobPositionId : null);

        setItemNo(obj.itemNo);
        setPosition(obj.position);
        setGrade(obj.grade);
        setStep(obj.step);
        setIsEditing(true);
    };



    // DELETE
    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/plantilla/delete/${id}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error(await res.text());

            Swal.fire({
                icon: "success",
                title: "Deleted",
                text: "Plantilla deleted successfully!",
                timer: 1500,
                showConfirmButton: false
            });

            // Refresh table
            const refresh = await fetchWithAuth(
                `${API_BASE_URL_ADMINISTRATIVE}/api/plantilla/get-all`
            );
            const list = await refresh.json();

            setPlantilla(
                list.map((p: PlantillaAPI) => {
                    const job = jobPositions.find(j => j.jobPositionId === p.jobPositionId);

                    return {
                        plantillID: p.plantillaId.toString(),
                        itemNo: p.plantillaName,
                        position: job ? job.jobPositionName : "",
                        grade: job ? job.salaryGrade : "",
                        step: job ? job.salaryStep : "",
                    };
                })
            );

        } catch (err) {
            console.error("Delete failed:", err);
            Swal.fire({
                icon: "error",
                title: "Delete Failed",
                text: "Unable to delete plantilla.",
            });
        }

        setIsEditing(false);
    };

    // CLEAR BUTTON
    const handleClear = () => {
        setItemNo("");
        setPosition("");
        setGrade("");
        setStep("");
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

                            {jobPositions.map((pos) => (
                                <option
                                key={pos.jobPositionId}
                                value={pos.jobPositionName}
                                >
                                {pos.jobPositionName}
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

                        <label>Salary Step</label>
                        <input
                            readOnly
                            value={step}
                            type="text"
                            required
                        />

                        <div className={styles.buttonGroup}>
                            <button
                                type="submit"
                                className={
                                isEditing ? styles.updateButton : styles.saveButton
                                }
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

                    {plantilla.length > 0 && (
                        <div className={styles.PlantillaTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Plantilla/Item No</th>
                                        <th>Position</th>
                                        <th>Salary Grade</th>
                                        <th>Salary Step</th> 
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plantilla.map((pl, indx) => (
                                        <tr key={pl.plantillID ?? `row-${indx}`}>
                                        <td>{pl.itemNo}</td>
                                        <td>{pl.position}</td>
                                        <td>{pl.grade}</td>
                                        <td>{pl.step}</td>
                                        <td>
                                            <button
                                            className={`${styles.iconButton} ${styles.editIcon}`}
                                            onClick={() => handleEdit(pl)}
                                            title="Edit"
                                            >
                                            <FaRegEdit />
                                            </button>
                                            <button
                                            className={`${styles.iconButton} ${styles.deleteIcon}`}
                                            onClick={() =>
                                                handleDelete(Number(pl.plantillID))
                                            }
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
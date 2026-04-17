"use client"


import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/ManagePersonnel.module.scss";
import { FaTrashAlt, FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";
import { Employee } from "@/lib/types/Employee";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

type ManagePersonnelEntry = {
    id?: number;
    employeeId?: number;
    employeeNo?: string;
    employeeName: string;
    businessUnitId?: number;
    areaId?: number;
    head: number;
    coApprover: number;
    otherStatus: string;
    status?: string;
    base?: string;
};

type RowSelection = {
    selected: boolean;
    head: boolean;
    coApprover: boolean;
};

type Area = {
    areasId: number;
    areasName: string;
    areasDescription: string;
};

type BusinessUnit = {
    businessUnitsId: number;
    businessUnitsName: string;
    businessUnitsCode: string;
    areasId: number;
};

const pageSizeOptions = [25, 50, 100, 300, 500, 750, 1000];

export default function ManagePersonnel() {
    const [areas, setAreas] = useState<Area[]>([]);
    const [units, setUnits] = useState<BusinessUnit[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    // Removed tempUnits state, no longer needed
    const [rowState, setRowState] = useState<Record<string, RowSelection>>({});
    const [entry, setEntry] = useState<ManagePersonnelEntry[]>([]);
    const [selectedArea, setSelectedArea] = useState<string>("");
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [selectedUnit, setSelectedUnit] = useState<string>("");
    const [otherStatus, setOtherStatus] = useState<{ [key: string]: string }>({});
    const [base, setBase] = useState<{ [key: string]: string }>({});
    const [fieldOne, setFieldOne] = useState(false);
    const [fieldTwo, setFieldTwo] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch Areas
    useEffect(() => {
        fetchWithAuth(`${API_BASE_URL}/api/areas/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(data => setAreas(data))
            .catch(() => setAreas([]));
    }, []);

    // Fetch Business Units
    useEffect(() => {
        fetchWithAuth(`${API_BASE_URL}/api/businessUnits/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then(data => setUnits(data))
            .catch(() => setUnits([]));
    }, []);

    // Load all employees from localStorage (master list, not filtered by business unit)
    useEffect(() => {
        setEmployees(localStorageUtil.getEmployees());
    }, []);

    // Fetch Manage Personnel entries and enrich with employee info from localStorage
    useEffect(() => {
        const allEmployees = localStorageUtil.getEmployees();
        fetchWithAuth(`${API_BASE_URL}/api/manage-personnel/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then((data: ManagePersonnelEntry[]) => {
                const enriched = data.map(entry => {
                    const emp = allEmployees.find(e => e.employeeId === entry.employeeId);
                    return {
                        ...entry,
                        employeeNo: emp?.employeeNo ?? "",
                        employeeName: emp?.fullName ?? "",
                    };
                });
                setEntry(enriched);
            })
            .catch(() => setEntry([]));
    }, [selectedUnit]);

    const filteredUnits = units.filter((unit) => {
        const area = areas.find(a => a.areasId === unit.areasId);
        return area && area.areasName === selectedArea;
    });

    const selectedUnitObj = filteredUnits.find(u => u.businessUnitsName === selectedUnit);
    const entryForSelectedUnit = entry.filter(e => e.businessUnitId === selectedUnitObj?.businessUnitsId);

    const handleAdd = async () => {
        if(hasSelectedEmployee) {
            const selected = employees.filter((emp) => rowState[emp.employeeNo]?.selected);

            // Validate: Main Base of Approval Level must be selected for all selected employees
            const missingBase = selected.filter(emp => !base[emp.employeeNo]);
            if (missingBase.length > 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Missing Main Base Approval Level",
                    html: `Please select <b>Yes</b> or <b>No</b> for Main Base of Approval Level for:<br/><b>${missingBase.map(e => e.fullName).join(", ")}</b>`,
                });
                return;
            }

            // Check for duplicates already in the designated list for this unit
            const duplicates = selected.filter(emp =>
                entryForSelectedUnit.some(e => e.employeeId === emp.employeeId)
            );

            if (duplicates.length === selected.length) {
                Swal.fire({
                    icon: "warning",
                    title: "Already Designated",
                    text: `${duplicates.map(e => e.fullName).join(", ")} ${duplicates.length > 1 ? "are" : "is"} already in the designated list.`,
                });
                return;
            }

            if (duplicates.length > 0) {
                const confirm = await Swal.fire({
                    icon: "warning",
                    title: "Some Already Designated",
                    html: `The following ${duplicates.length > 1 ? "employees are" : "employee is"} already designated and will be skipped:<br/><b>${duplicates.map(e => e.fullName).join(", ")}</b>`,
                    showCancelButton: true,
                    confirmButtonText: "Continue with the rest",
                    cancelButtonText: "Cancel",
                });
                if (!confirm.isConfirmed) return;
            }

            const newEmployees = selected
                .filter(emp => !entryForSelectedUnit.some(e => e.employeeId === emp.employeeId))
                .map((emp) => ({
                employeeId: emp.employeeId,
                employeeNo: emp.employeeNo,
                employeeName: emp.fullName,
                businessUnitId: selectedUnitObj?.businessUnitsId,
                areaId: selectedUnitObj?.areasId,
                head: rowState[emp.employeeNo]?.head ? 1 : 0,
                coApprover: rowState[emp.employeeNo]?.coApprover ? 1 : 0,
                otherStatus: otherStatus[emp.employeeNo] || "",
                base: base[emp.employeeNo] || "",
            }));

            try {
                const res = await fetchWithAuth(`${API_BASE_URL}/api/manage-personnel/save`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newEmployees),
                });

                if (!res.ok) throw new Error(await res.text());

                const saved: ManagePersonnelEntry[] = await res.json();
                const enriched = newEmployees.map((emp, i) => ({
                    ...emp,
                    id: saved[i]?.id,
                }));

                setEntry((prev) => [...prev, ...enriched]);
                setRowState({});
                setOtherStatus({});
                setBase({});

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
            } catch {
                Swal.fire({
                    icon: "error",
                    title: "Failed to save",
                    text: "An error occurred while saving. Please try again.",
                });
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Select atleast one employee!",
            });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            text: `Are you sure you want to delete this record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(async result => {
            if(result.isConfirmed) {
                try {
                    const res = await fetchWithAuth(
                        `${API_BASE_URL}/api/manage-personnel/delete/${id}`,
                        { method: "DELETE" }
                    );

                    if (!res.ok) throw new Error(await res.text());

                    setEntry(prev => prev.filter(s => s.id !== id));

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
                        title: "Successfully Deleted!"
                    });
                } catch {
                    Swal.fire({
                        icon: "error",
                        title: "Failed to delete",
                        text: "An error occurred while deleting. Please try again.",
                    });
                }
            }
        })
    };

    // Always use the master employee list for Designate Personnel
    const filteredEmployees = employees.filter((emp) => {
        const q = search.toLowerCase();
        return emp.fullName.toLowerCase().includes(q) || emp.employeeNo.toLowerCase().includes(q);
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, itemsPerPage]);

    const hasSelectedEmployee = filteredEmployees.some(
        (emp) => rowState[emp.employeeNo]?.selected
    );

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Manage Personnel</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.BusinessUnitsForm}>
                        <label>Areas</label>
                        <select
                            className={styles.main_select}
                            id="businessUnit"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            required>
                            <option value="" disabled>
                            Select Areas
                            </option>

                            {areas.map((a) => (
                                <option key={a.areasId} value={a.areasName}>
                                    {a.areasName}
                                </option>
                            ))}
                        </select>
                        {selectedArea.trim() != "" && (
                             <div>
                                <label>Business Unit</label>
                                <select className={styles.main_select} id="unit" required value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                                    <option value="" disabled>
                                        Select Unit
                                    </option>
                                    {filteredUnits.map((unit) => (
                                        <option key={unit.businessUnitsId} value={unit.businessUnitsName}>
                                            {unit.businessUnitsName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {selectedUnit.trim() != "" && (
                            <div>
                                 <h2>{selectedUnit}</h2>
                                 <div className={styles.designatedbtn} onClick={() => {
                                    setFieldOne(prev => !prev);
                                 }}>
                                    <span className={styles.icon}><FaUsers size={15}/></span>
                                    <span className="text">View {entryForSelectedUnit.length > 0 && ` (${entryForSelectedUnit.length})`} Designated Personnel</span>
                                </div>
                                <div className={`${styles.containerUnit} ${
                                    fieldOne ? styles.open : styles.closed
                                }`}>
                                    {entryForSelectedUnit.length > 0 ? (
                                        <div className={styles.designatedTable}>
                                            <div className={`${styles.BusinessUnitsTable} ${
                                                fieldOne ? styles.open : styles.closed
                                            }`}>
                                                <table className={styles.table}>
                                                    <thead>
                                                        <tr>
                                                            <th>Employee No.</th>
                                                            <th>Employee Name</th>
                                                            <th>Head</th>
                                                            <th>Co-Approver</th>
                                                            <th>Other Status</th>
                                                            <th>Main Base of Approval Level</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entryForSelectedUnit.map((ent, indx) => (
                                                            <tr key={ent.employeeNo ?? `row-${indx}`}>
                                                                <td>{ent.employeeNo}</td>
                                                                <td>{ent.employeeName}</td>
                                                                <td>{ent.head === 1 ? 'Yes' : 'No'}</td>
                                                                <td>{ent.coApprover === 1 ? 'Yes' : 'No'}</td>
                                                                <td>{ent.otherStatus}</td>
                                                                <td>{ent.base}</td>
                                                                <td>
                                                                    <button
                                                                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                                         onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handleDelete(ent.id!)}
                                                                        }
                                                                        title="Delete">
                                                                        <FaTrashAlt size={17}/>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className={styles.noPersonnel}>No designated personnel yet.</p>
                                    )}
                                    
                                </div>
                            </div>
                        )}

                        {selectedUnit.trim() != "" && (
                            <div>
                                <div className={`${styles.designatedbtn} ${styles.designatebtn}`} onClick={() => {
                                    setFieldTwo(prev => !prev);
                                }}>
                                    <span className={styles.icon}><FaUsers size={15}/></span>
                                    <span className="text">Designate Personnel</span>
                                </div>
                                {/* {fieldTwo && ( */}
                                    <div className={`${styles.containerUnit} ${
                                                fieldTwo ? styles.open : styles.closed
                                            }`}>
                                        <div className={styles.search}>
                                            <div className={styles.inputWrapper}>
                                                <input
                                                    placeholder="Search Employee"
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}/>
                                                <span className={styles.iconSearch}><FaSearch /></span>
                                            </div>
                                            <div className={styles.paginationControls}>
                                                <label>Rows per page: </label>
                                                <select
                                                    className={styles.row_select}
                                                    value={itemsPerPage}
                                                    onChange={(e) => {
                                                        setItemsPerPage(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    }}>
                                                    {pageSizeOptions.map((size) => (
                                                        <option key={size} value={size}>{size}</option>
                                                    ))}
                                                </select>
                                                <span className={styles.recordInfo}>
                                                    Showing {filteredEmployees.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length}
                                                </span>
                                                <button
                                                    className={styles.pageBtn}
                                                    disabled={currentPage === 1}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}>First
                                                </button>
                                                <button
                                                    className={styles.pageBtn}
                                                    disabled={currentPage === 1}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(p - 1, 1)); }}>Previous
                                                </button>
                                                <span className={styles.pageIndicator}>Page {currentPage} of {totalPages || 1}</span>
                                                <button
                                                    className={styles.pageBtn}
                                                    disabled={currentPage === totalPages || totalPages === 0}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(p + 1, totalPages)); }}>Next
                                                </button>
                                                <button
                                                    className={styles.pageBtn}
                                                    disabled={currentPage === totalPages || totalPages === 0}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}>Last
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.BusinessUnitsTable}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th>Select</th>
                                                        <th>Employee No.</th>
                                                        <th>Employee Name</th>
                                                        <th>Head</th>
                                                        <th>Co-Approver</th>
                                                        <th>Other Status</th>
                                                        <th>Main Base Approval level</th>
                                                    </tr>
                                                </thead>
                                                {paginatedEmployees.length > 0 && (
                                                    <tbody> 
                                                     {paginatedEmployees.map((emp, indx) => (
                                                        <tr key={emp.employeeNo ?? `row-${indx}`}>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rowState[emp.employeeNo]?.selected || false}
                                                                    onChange={(e) =>
                                                                    setRowState((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeNo]: {
                                                                        ...prev[emp.employeeNo],
                                                                        selected: e.target.checked,
                                                                        },
                                                                    }))
                                                                    }
                                                                />
                                                            </td>
                                                            <td>{emp.employeeNo}</td>
                                                            <td>{emp.fullName}</td>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rowState[emp.employeeNo]?.head || false}
                                                                    onChange={(e) =>
                                                                    setRowState((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeNo]: {
                                                                        ...prev[emp.employeeNo],
                                                                        head: e.target.checked,
                                                                        },
                                                                    }))
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rowState[emp.employeeNo]?.coApprover || false}
                                                                    onChange={(e) =>
                                                                    setRowState((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeNo]: {
                                                                        ...prev[emp.employeeNo],
                                                                        coApprover: e.target.checked,
                                                                        },
                                                                    }))
                                                                    }
                                                                />
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className={styles.stastus_base_base}
                                                                    id="otherStatus"
                                                                    value={otherStatus[emp.employeeNo] || ""}
                                                                    onChange={(e) =>
                                                                        setOtherStatus((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeNo]: e.target.value,
                                                                        }))
                                                                    }>
                                                                    <option value=""></option>
                                                                    <option value="Head of Agency">Head of Agency</option>
                                                                    <option value="Head of HR">Head of HR</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <select
                                                                    className={styles.stastus_base_base}
                                                                    id="otherStatus"
                                                                    value={base[emp.employeeNo] || ""}
                                                                    onChange={(e) =>
                                                                        setBase((prev) => ({
                                                                        ...prev,
                                                                        [emp.employeeNo]: e.target.value,
                                                                        }))
                                                                    }>
                                                                    <option value=""></option>
                                                                    <option value="Yes">Yes</option>
                                                                    <option value="No">No</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}                                                  
                                                </tbody>
                                            )}
                                                
                                            </table>
                                        </div>
                                    </div>
                                {/* )} */}
                                {fieldTwo && (
                                    <div className={styles.buttonGroup}>
                                        <button
                                            type="button"
                                            className={styles.saveButton}
                                            onClick={handleAdd}>
                                            <FaPlus size={15}/>
                                            <span className={styles.addBtn}>Add</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
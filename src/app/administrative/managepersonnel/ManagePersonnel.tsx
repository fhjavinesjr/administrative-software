"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/ManagePersonnel.module.scss";
import { FaTrashAlt, FaUsers, FaPlus, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";

export default function ManagePersonnel() {
    type ManagePersonnelEntry = {
        employeeNo: string;
        employeeName: string;
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

    type Employee = {
        employeeNo: string;
        employeeName: string;
    };

    const [tempUnits, setTempUnits] = useState<Employee[]>([]);
    const [rowState, setRowState] = useState<Record<string, RowSelection>>({});
    const [entry, setEntry] = useState<ManagePersonnelEntry[]>([]);
    const [selectedArea, setSelectedArea] = useState<string>("");
    const [selectedUnit, setSelectedUnit] = useState<string>("");
    const [otherStatus, setOtherStatus] = useState<{ [key: string]: string }>({});
    const [base, setBase] = useState<{ [key: string]: string }>({});
    const [fieldOne, setFieldOne] = useState(false);
    const [fieldTwo, setFieldTwo] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const areas = [
        { code: 'HR', description: 'Human Resources' },
        { code: 'Admin', description: 'Administrative' },
        { code: 'Accounting', description: 'Accounting' },
    ];

    const units = [
        { code: 'HR', description: 'Talent Acquisition' },
        { code: 'HR', description: 'Training & Development' },
        { code: 'HR', description: 'Compensation & Benefits' },
        { code: 'Admin', description: 'Facilities & Maintenance' },
        { code: 'Admin', description: 'Procurement & Inventory' },
        { code: 'Admin', description: 'Records & Documentation' },
        { code: 'Accounting', description: 'Accounts Payable' },
        { code: 'Accounting', description: 'Payroll & Employee Accounting' },
        { code: 'Accounting', description: 'Budgeting & Cost Control' },
    ];

    const employees = [
        { employeeNo: '001', employeeName: 'James' },
        { employeeNo: '002', employeeName: 'Mike' },
        { employeeNo: '003', employeeName: 'Jane' },
        { employeeNo: '004', employeeName: 'David' },
        { employeeNo: '005', employeeName: 'Casper' },
        { employeeNo: '006', employeeName: 'Kevin' },
        { employeeNo: '007', employeeName: 'Duncan' },
        { employeeNo: '008', employeeName: 'Anderson' },
        { employeeNo: '009', employeeName: 'Jina' },
        { employeeNo: '0010', employeeName: 'Arc' },
        { employeeNo: '0011', employeeName: 'Benjamine' },
        { employeeNo: '0012', employeeName: 'Joseph' },
        { employeeNo: '0013', employeeName: 'Maco' },
        { employeeNo: '0014', employeeName: 'Biston' },
        { employeeNo: '0015', employeeName: 'Asher' },
        { employeeNo: '0016', employeeName: 'Dana' },
        { employeeNo: '0017', employeeName: 'Joyce' },
        { employeeNo: '0018', employeeName: 'Grace' },
    ];

    const filteredUnits = units.filter((unit) => unit.code === selectedArea);

    const handleAdd = () => {
        if(hasSelectedEmployee) {
            const selectedEmployees = employees
                .filter((emp) => rowState[emp.employeeNo]?.selected)
                .map((emp) => ({
                employeeNo: emp.employeeNo,
                employeeName: emp.employeeName,
                head: rowState[emp.employeeNo]?.head ? 1 : 0,
                coApprover: rowState[emp.employeeNo]?.coApprover ? 1 : 0,
                otherStatus: otherStatus[emp.employeeNo] || "",
                base: base[emp.employeeNo] || "",
            }));

            setEntry((prev) => [...prev, ...selectedEmployees]);
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
        } else {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Select atleast one employee!",
            });
        }
    };

    const handleDelete = (type: string) => {
        Swal.fire({
            text: `Are you sure you want to delete the "${type}" record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(result => {
            if(result.isConfirmed) {
                const res = entry.filter(s => s.employeeNo != type);
                setEntry(res);
            }
        })
    };

    const filteredEmployees = tempUnits.filter((emp) =>
        emp.employeeName.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);

    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

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
                            <option key={a.code} value={a.code}>
                                {a.description}
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
                                    {filteredUnits.map((unit, index) => (
                                        <option key={index} value={unit.description}>
                                            {unit.description}
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
                                    <span className="text">View {entry.length > 0 && ` (${entry.length})`} Designated Personnel</span>
                                </div>
                                <div className={`${styles.containerUnit} ${
                                    fieldOne ? styles.open : styles.closed
                                }`}>
                                    {entry.length > 0 ? (
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
                                                        {entry.map((ent, indx) => (
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
                                                                            handleDelete(ent.employeeNo)}
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
                                    const temp = employees.map((emp) => ({
                                        ...emp,
                                    }));
                                        setTempUnits(temp);
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
                                            <div>
                                                <button 
                                                    className={styles.pageBtn}
                                                    disabled={currentPage === 1}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage((p) => Math.max(p - 1, 1))
                                                    }}>Prev.
                                                </button>
                                                <button 
                                                    className={styles.pageBtn}
                                                    disabled={currentPage === totalPages || totalPages === 0}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                                                    }}>Next
                                                </button>
                                            </div>
                                        </div>
                                        <div className={`${styles.BusinessUnitsTable} ${
                                                fieldTwo ? styles.open : styles.closed
                                            }`}>
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
                                                {tempUnits.length > 0 && (
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
                                                            <td>{emp.employeeName}</td>
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
                                        <div className={styles.buttonGroup}>
                                            <button
                                                type="button"
                                            
                                                className={styles.saveButton}
                                                onClick={handleAdd}>
                                                <FaPlus size={15}/>
                                                <span className={styles.addBtn}>Add</span>
                                            </button>
                                        </div>
                                    </div>
                                {/* )} */}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
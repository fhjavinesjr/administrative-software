"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/ApprovalWorkflow.module.scss";
import { FaTrashAlt, FaUsers, FaPlus, FaSearch  } from "react-icons/fa";
import Swal from "sweetalert2";

export default function ApprovalWorkFlow() {
    type WorkflowEntry = {
        employeeNo: string;
        employeeName: string;
        status: string;
        otherStatus: string;
        mainBase: string;
        desc: string;
    };

    type EmployeeEntry = {
        employeeNo: string;
        employeeName: string;
        status: string;
        otherStatus: string;
        mainBase: string;
    };

    const [selectEmployee, setSelectEmployee] = useState<EmployeeEntry | null>(null)
    const [entry, setEntry] = useState<WorkflowEntry[]>([]);
    const [selectedArea, setSelectedArea] = useState<string>("");
    const [selectedUnit, setSelectedUnit] = useState<string>("");
    const [selectedEmployeeRequest, setSelectedEmployeeRequest] = useState<string>("");
    const [search, setSearch] = useState("");

    const [fieldOne, setFieldOne] = useState(false);

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

    const assignedUnits = [
        { employeeNo: '001', employeeName: 'James', status: 'Head', otherStatus: '', mainBase: 'No', desc: 'Talent Acquisition' },
        { employeeNo: '002', employeeName: 'Mike', status: 'Co-Approver', otherStatus: '', mainBase: 'No', desc: 'Training & Development' },
        { employeeNo: '003', employeeName: 'Jane', status: 'Co-Approver', otherStatus: '', mainBase: 'No', desc: 'Compensation & Benefits' },
        { employeeNo: '004', employeeName: 'David', status: 'Head', otherStatus: '', mainBase: 'No', desc: 'Facilities & Maintenanc' },
        { employeeNo: '005', employeeName: 'Casper', status: 'Head', otherStatus: '', mainBase: 'No', desc: 'Procurement & Inventory' },
        { employeeNo: '006', employeeName: 'Kevin', status: 'Co-Approver', otherStatus: '', mainBase: 'No', desc: 'Records & Documentation' },
        { employeeNo: '007', employeeName: 'Duncan', status: 'Head', otherStatus: '', mainBase: 'No', desc: 'Accounts Payable' },
        { employeeNo: '008', employeeName: 'Anderson', status: 'Co-Approver', otherStatus: '', mainBase: 'No', desc: 'Payroll & Employee Accounting' },
        { employeeNo: '009', employeeName: 'Anita', status: 'Co-Approver', otherStatus: '', mainBase: 'No', desc: 'Budgeting & Cost Control' },
        { employeeNo: '0010', employeeName: 'Jina', status: 'Head', otherStatus: '', mainBase: 'No', desc: 'Talent Acquisition' },
        { employeeNo: '0011', employeeName: 'Maria', status: 'Rank and File', otherStatus: '', mainBase: 'No', desc: 'Training & Development' },
        { employeeNo: '0012', employeeName: 'marco', status: 'Rank and File', otherStatus: '', mainBase: 'No', desc: 'Compensation & Benefits' },
    ];

    const filteredUnits = units.filter((unit) => unit.code === selectedArea);
    const filteredAssignedUnits = assignedUnits.filter((unit) => unit.desc === selectedUnit);

    const handleAdd = () => {
        if (!selectEmployee) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Select Employee!",
            });
            return;
        }
        
        const filteredEmployee = assignedUnits.filter(f => f.employeeName == search);
        setEntry((prev) => [...prev, ...filteredEmployee]);

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

        setSearch("");
    };

    const handleDelete = (name: string, index: number) => {
        

        Swal.fire({
            text: `Are you sure you want to delete "${name}" record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(result => {
            if(result.isConfirmed) {
                setEntry((prev) => prev.filter((_, i) => i !== index));
            }
        })
    };

    return (
        <div className={modalStyles.Modal}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Approval Workflow</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.ApprovalWorkflowForm}>
                        <label>Areas</label>
                        <select
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
                                <select id="unit" required value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
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
                                <label>Employee Request</label>
                                <select id="unit" required value={selectedEmployeeRequest} onChange={(e) => setSelectedEmployeeRequest(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Leave Application">Leave Application</option>
                                    <option value="Time Correction">Time Correction</option>
                                </select>
                            </div>
                        )}
                        {selectedEmployeeRequest.trim() != "" && (
                            <div>
                                <h2>{selectedUnit}</h2>
                                <div className={styles.designatedbtn} onClick={() => {
                                    setFieldOne(prev => !prev);
                                    }}>
                                    <span className={styles.icon}><FaUsers size={15}/></span>
                                    <span className="text">View {filteredAssignedUnits.length > 0 && ` (${filteredAssignedUnits.length})`} Designated Personnel</span>
                                </div>
                                <div className={`${styles.containerUnit} ${
                                    fieldOne ? styles.open : styles.closed
                                }`}>
                                    <div className={styles.designatedTable}>
                                        <div className={`${styles.ApprovalWorkflowTable} ${
                                                fieldOne ? styles.open : styles.closed
                                            }`}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th>Employee No.</th>
                                                        <th>Employee Name</th>
                                                        <th>Status</th>
                                                        <th>Other Status</th>
                                                        <th>Main Base of Approval Level</th>
                                                    </tr>
                                                </thead>
                                                {/* selectedUnit */}
                                                <tbody>
                                                    {filteredAssignedUnits.map((ent, indx) => (
                                                        <tr key={ent.employeeNo ?? `row-${indx}`}>
                                                            <td>{ent.employeeNo}</td>
                                                            <td>{ent.employeeName}</td>
                                                            <td>{ent.status}</td>
                                                            <td>{ent.otherStatus}</td>
                                                            <td>No</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.containerRequestEmployeeField}>
                                    <div className={styles.search}>
                                        <div className={styles.inputWrapper}>
                                            <input
                                                placeholder="Search Employee"
                                                type="text"
                                                list="employee-unit"
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    const selected = assignedUnits.find(
                                                        (unit) =>
                                                        unit.employeeName.toLowerCase() ==
                                                        e.target.value.toLowerCase()
                                                    );
                                                    console.log(selected);
                                                    setSelectEmployee(selected || null);
                                                }}/>
                                                {(
                                                    <datalist id="employee-unit">
                                                        {assignedUnits.map((unit) => (
                                                        <option
                                                            key={unit.employeeNo}
                                                            value={unit.employeeName}
                                                        />
                                                        ))}
                                                    </datalist>
                                                )}
                                                <span className={styles.iconSearch}><FaSearch /></span>
                                        </div>
                                        <div className={styles.btnGroup}>
                                            <button
                                                type="button"
                                                onClick={handleAdd}
                                                className={styles.saveButton}>
                                                <FaPlus size={15}/>
                                                <span className={styles.addBtn}>Add</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.ApprovalWorkflowTable}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Approval Level</th>
                                                    <th>Employee Name</th>
                                                    <th>Status</th>
                                                    <th>Under</th>
                                                    <th>Name of Filing</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            {entry.length > 0 && (
                                                <tbody>
                                                    {entry.map((ent, entindx) => (
                                                        <tr key={entindx}>
                                                            <td>{entindx + 1}</td>
                                                            <td>{ent.employeeName}</td>
                                                            <td>{ent.status}</td>
                                                            <td>Area 51</td>
                                                            <td>{selectedEmployeeRequest}</td>
                                                            <td>
                                                                <button
                                                                    className={`${styles.iconButton} ${styles.deleteIcon}`}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDelete(ent.employeeName, entindx)
                                                                    }}
                                                                    title="Delete">
                                                                    <FaTrashAlt size={15}/>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
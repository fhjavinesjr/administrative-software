"use client"

import React, { useState } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/SystemSetup.module.scss";
import { FaCloudUploadAlt, FaRegEdit, FaTrashAlt } from "react-icons/fa";
// import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import Swal from "sweetalert2";

export default function SystemSetup() {
    type settingsEntry = {
        date: string;
        companyName: string;
        shortName: string;
        city: string;
        address: string;
        isDOH: boolean;
        iso: string;
        zipcode: string;
        telNo: string;
        email: string;
        tinNo: string;
        pagibigNo: string;
        philhealtNo: string;
        
    };

    const [date, setDate] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [shortName, setShortName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [iso, setISO] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [telNo, setTelNo] = useState("");
    const [email, setEmail] = useState("");
    const [tinNo, setTinNo] = useState("");
    const [pagibigNo, setPagibigNo] = useState("");
    const [philhealtNo, setPhilhealthNo] = useState("");
    const [isDOH, setIsDOH] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [entry, setEntry] = useState<settingsEntry[]>([]);
    const [editIndex, setEditIndex] = useState<number | null>(null)

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: settingsEntry = {date,companyName,shortName,city,address,isDOH,iso,zipcode,telNo,email,tinNo,pagibigNo,philhealtNo}
        
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
        setCompanyName("");
        setShortName("");
        setAddress("");
        setCity("");
        setISO("");
        setZipcode("");
        setTelNo("");
        setEmail("");
        setTinNo("");
        setPagibigNo("");
        setPhilhealthNo("");
        setIsDOH(false);
        setIsEditing(false);
    };

    const handleDelete = (indx: number) => {
        if(date) {
            handleClear();
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

    const handleEdit = (obj: settingsEntry, index: number) => {
        setEditIndex(index);
        setDate(obj.date);
        setCompanyName(obj.companyName);
        setShortName(obj.shortName);
        setAddress(obj.address);
        setCity(obj.city);
        setISO(obj.iso);
        setZipcode(obj.zipcode);
        setTelNo(obj.telNo);
        setEmail(obj.email);
        setTinNo(obj.tinNo);
        setPagibigNo(obj.pagibigNo);
        setPhilhealthNo(obj.philhealtNo);
        setIsEditing(true);
    };

    return (
        <div className={modalStyles.Modal}>
             <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h2 className={modalStyles.mainTitle}>Settings</h2>
                </div>
                <div className={modalStyles.modalBody}>
                    <form className={styles.SystemSetup} onSubmit={onSubmit}>
                        <div className={styles.formGrid}>
                            <div className={styles.column}>
                                 <label>Beginning Balance</label>
                                <input
                                    className={styles.date}
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required={true}
                                />
                                <label>Company Name</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    required={true}
                                />
                                <label>Short Name</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={shortName}
                                    onChange={e => setShortName(e.target.value)}
                                    required={true}
                                />
                                <label>City</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    required={true}
                                />
                                <label>Address</label>
                                <textarea
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className={styles.address}
                                />
                                <label>Is DOH?</label>
                                <div className={styles.checkboxWrapper}>
                                    <input
                                        className={styles.checkbox}
                                        type="checkbox"
                                        checked={isDOH}
                                        onChange={(e) => setIsDOH(e.target.checked)}
                                    />
                                    <span className={styles.check}>(Leave Uncheck if not)</span>
                                </div>
                            </div>
                            <div className={styles.column}>
                                <label>ISO</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={iso}
                                    onChange={e => setISO(e.target.value)}
                                    required={true}
                                />
                                <label>ZIP Code</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={zipcode}
                                    onChange={e => setZipcode(e.target.value)}
                                    required={true}
                                />
                                <label>Telephone/Mobile No.</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={telNo}
                                    onChange={e => setTelNo(e.target.value)}
                                    required={true}
                                />
                                <label>Email Address</label>
                                <input
                                    className={styles.date}
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required={true}
                                />
                                <label>TIN No.</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={tinNo}
                                    onChange={e => setTinNo(e.target.value)}
                                    required={true}
                                />
                                <label>Pag-Ibig No.</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={pagibigNo}
                                    onChange={e => setPagibigNo(e.target.value)}
                                    required={true}
                                />
                                <label>PhilHealth No.</label>
                                <input
                                    className={styles.date}
                                    type="text"
                                    value={philhealtNo}
                                    onChange={e => setPhilhealthNo(e.target.value)}
                                    required={true}
                                />
                            </div>
                        </div>
                        <label>Upload Logo</label>
                        <div className={styles.buttonGroup}>
                             {["Left Header", "Main Menu", "Right Header"].map((label, index) => (
                                <div key={index}>
                                    <input
                                        type="file"
                                        id={`fileUpload-${index}`}
                                        style={{ display: "none" }} // hide the actual input
                                        onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            console.log(`${label} file selected:`, e.target.files[0]);
                                        }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className={styles.iconButton}
                                        onClick={() => document.getElementById(`fileUpload-${index}`)?.click()}
                                    >
                                        <FaCloudUploadAlt className={styles.icon} />
                                        {label}
                                    </button>
                                </div>
                            ))}
                            {/* <button className={styles.iconButton}>
                                <FaCloudUploadAlt className={styles.icon} />
                                Left Header
                            </button>
                            <button className={styles.iconButton}>
                                <FaCloudUploadAlt className={styles.icon} />
                                Main Menu
                            </button>
                            <button className={styles.iconButton}>
                                <FaCloudUploadAlt className={styles.icon} />
                                Right Header
                            </button> */}
                        </div>
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
                    {entry.length > 0  && (
                        <div>
                            <h4 className={styles.tableHeader}>SETTING TABLE</h4>
                            <div className={styles.SystemSetupTable}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Balance Date</th>
                                            <th>Company Name</th>
                                            <th>Alias</th>
                                            <th>City</th>
                                            <th>Address</th>
                                            <th>Is DOH</th>
                                            <th>ISO</th>
                                            <th>Zip Code</th>
                                            <th>Tel./Mobile No.</th>
                                            <th>Email Address</th>
                                            <th>TIN No.</th>
                                            <th>Pag-Ibig No.</th>
                                            <th>PhilHealt No.</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.map((ent, indx) => (
                                            <tr key={ent.date ?? `row-${indx}`}>
                                                <td>{ent.date}</td>
                                                <td>{ent.companyName}</td>
                                                <td>{ent.shortName}</td>
                                                <td>{ent.city}</td>
                                                <td>{ent.address}</td>
                                                <td>{ent.isDOH ? "Yes" : "No"}</td>
                                                <td>{ent.iso}</td>
                                                <td>{ent.zipcode}</td>
                                                <td>{ent.telNo}</td>
                                                <td>{ent.email}</td>
                                                <td>{ent.tinNo}</td>
                                                <td>{ent.pagibigNo}</td>
                                                <td>{ent.philhealtNo}</td>
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
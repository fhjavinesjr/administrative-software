"use client"

import React, { useState, useEffect } from "react";
import modalStyles from "@/styles/Modal.module.scss";
import styles from "@/styles/SystemSetup.module.scss";
import { FaCloudUploadAlt, FaRegEdit, FaTrashAlt } from "react-icons/fa";
import { toCustomFormat, toDateInputValue } from "@/lib/utils/dateFormatUtils";
import { fetchWithAuth } from "@/lib/utils/fetchWithAuth";
import Swal from "sweetalert2";

const API_BASE_URL_ADMINISTRATIVE = process.env.NEXT_PUBLIC_API_BASE_URL_ADMINISTRATIVE;

export default function SystemSetup() {
    type settingsEntry = {
        settingsId?: number | null;
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
        // optional base64 logo fields returned by backend
        leftHeaderLogoBase64?: string | null;
        mainLogoBase64?: string | null;
        rightHeaderLogoBase64?: string | null;
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

    // backend id when editing
    const [settingsId, setSettingsId] = useState<number | null>(null);

    // logo base64 strings
    const [leftLogoBase64, setLeftLogoBase64] = useState<string | null>(null);
    const [mainLogoBase64, setMainLogoBase64] = useState<string | null>(null);
    const [rightLogoBase64, setRightLogoBase64] = useState<string | null>(null);

    type SettingsPayload = {
        systemStartDate: string | null;
        companyName: string;
        shortName: string;
        city: string;
        address: string;
        hospitalAgency: boolean;
        isoNo: string;
        zipCode: string;
        telMobileNo: string;
        emailAddress: string;
        tinNo: string;
        pagIbigNo: string;
        philHealthNo: string;
        leftHeaderLogo?: string | null;
        mainLogo?: string | null;
        rightHeaderLogo?: string | null;
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: SettingsPayload = {
            systemStartDate: date ? toCustomFormat(date, true) : null,
            companyName,
            shortName,
            city,
            address,
            hospitalAgency: isDOH,
            isoNo: iso,
            zipCode: zipcode,
            telMobileNo: telNo,
            emailAddress: email,
            tinNo,
            pagIbigNo: pagibigNo,
            philHealthNo: philhealtNo,
            leftHeaderLogo: stripDataUrlPrefix(leftLogoBase64),
            mainLogo: stripDataUrlPrefix(mainLogoBase64),
            rightHeaderLogo: stripDataUrlPrefix(rightLogoBase64)
        };

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

        if (!isEditing) {
            // create
            fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/settings/create`, {
                method: "POST",
                body: JSON.stringify(payload)
            })
            .then(async res => {
                if (!res.ok) throw await res.text();
                return res.json();
            })
            .then(() => {
                Toast.fire({ icon: "success", title: "Successfully Created!" });
                handleClear();
                fetchSettings();
            })
            .catch(err => {
                Swal.fire({ icon: 'error', text: String(err) });
            });
        } else {
            // update
            if (settingsId == null) {
                Swal.fire({ icon: 'error', text: 'Missing settings id for update' });
                return;
            }

            Swal.fire({
                text: `Are you sure you want to update this record?`,
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Update",
                allowOutsideClick: true,
                backdrop: true,
            }).then(result => {
                if (result.isConfirmed) {
                    fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/settings/update/${settingsId}`, {
                        method: "PUT",
                        body: JSON.stringify(payload)
                    })
                    .then(async res => {
                        if (!res.ok) throw await res.text();
                        return res.json();
                    })
                    .then(() => {
                        Toast.fire({ icon: "success", title: "Successfully Updated!" });
                        handleClear();
                        fetchSettings();
                    })
                    .catch(err => Swal.fire({ icon: 'error', text: String(err) }));
                }
            });
        }
    };

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    type BackendSettings = {
        settingsId?: number;
        systemStartDate?: string;
        companyName?: string;
        shortName?: string;
        city?: string;
        address?: string;
        hospitalAgency?: boolean;
        isoNo?: string;
        zipCode?: string;
        telMobileNo?: string;
        emailAddress?: string;
        tinNo?: string;
        pagIbigNo?: string;
        philHealthNo?: string;
        leftHeaderLogoBase64?: string | null;
        mainLogoBase64?: string | null;
        rightHeaderLogoBase64?: string | null;
    };

    const fetchSettings = () => {
        fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/settings/get-all`)
            .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
            .then((data: BackendSettings[]) => {
                // Map backend DTO to local structure
                const mapped = data.map((d: BackendSettings) => ({
                    settingsId: d.settingsId,
                    date: d.systemStartDate ? toDateInputValue(d.systemStartDate) : "",
                    companyName: d.companyName || "",
                    shortName: d.shortName || "",
                    city: d.city || "",
                    address: d.address || "",
                    isDOH: !!d.hospitalAgency,
                    iso: d.isoNo || "",
                    zipcode: d.zipCode || "",
                    telNo: d.telMobileNo || "",
                    email: d.emailAddress || "",
                    tinNo: d.tinNo || "",
                    pagibigNo: d.pagIbigNo || "",
                    philhealtNo: d.philHealthNo || "",
                    leftHeaderLogoBase64: d.leftHeaderLogoBase64 || null,
                    mainLogoBase64: d.mainLogoBase64 || null,
                    rightHeaderLogoBase64: d.rightHeaderLogoBase64 || null
                } as settingsEntry));
                setEntry(mapped);
            })
            .catch(err => console.error('fetchSettings err', err));
    };

    // convert File -> dataURL (Base64) helper
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const onFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const dataUrl = await fileToBase64(file);
            if (index === 0) setLeftLogoBase64(dataUrl);
            if (index === 1) setMainLogoBase64(dataUrl);
            if (index === 2) setRightLogoBase64(dataUrl);
        } catch (err) {
            console.error('file to base64 error', err);
            Swal.fire({ icon: 'error', text: 'Failed to read file' });
        }
    };

    // Strip data URL prefix (e.g. "data:image/png;base64,...") to return only base64 payload
    const stripDataUrlPrefix = (dataUrl?: string | null): string | null => {
        if (!dataUrl) return null;
        const comma = dataUrl.indexOf(',');
        return comma >= 0 ? dataUrl.substring(comma + 1) : dataUrl;
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
        setSettingsId(null);
        setLeftLogoBase64(null);
        setMainLogoBase64(null);
        setRightLogoBase64(null);
    };

    const handleDelete = (indx: number) => {
        const target = entry[indx];
        if (!target || !target.settingsId) {
            // If no backend id, just remove locally
            setEntry(prev => prev.filter((_, i) => i !== indx));
            return;
        }

        Swal.fire({
            text: `Are you sure you want to delete this record?`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Delete",
            allowOutsideClick: true,
            backdrop: true,
        }).then(result => {
            if (result.isConfirmed) {
                fetchWithAuth(`${API_BASE_URL_ADMINISTRATIVE}/api/settings/delete/${target.settingsId}`, { method: 'DELETE' })
                    .then(res => {
                        if (!res.ok) throw new Error('Delete failed');
                        fetchSettings();
                        Swal.fire({ icon: 'success', title: 'Deleted' });
                    })
                    .catch(err => Swal.fire({ icon: 'error', text: String(err) }));
            }
        })
    };

    const handleEdit = (obj: settingsEntry) => {
        setSettingsId(obj.settingsId ?? null);
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
        // load logos if present
        setLeftLogoBase64(obj.leftHeaderLogoBase64 ?? null);
        setMainLogoBase64(obj.mainLogoBase64 ?? null);
        setRightLogoBase64(obj.rightHeaderLogoBase64 ?? null);
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
                                 <label>System Start Date</label>
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
                                <label>Hospital Agency</label>
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
                                        accept="image/*"
                                        id={`fileUpload-${index}`}
                                        style={{ display: "none" }} // hide the actual input
                                        onChange={(e) => onFileChange(index, e)}
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
                                                        onClick={() => handleEdit(ent)}
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
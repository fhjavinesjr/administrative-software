"use client";

import { useState } from "react";
import SalaryScheduleForm from "./SalaryScheduleForm";
import SalaryScheduleTable from "./SalaryScheduleTable";
import AuditTrailTable from "./SalaryScheduleTrailTable";
import salaryScheduleStyle from "@/styles/SalarySchedule.module.scss";
import modalStyles from "@/styles/Modal.module.scss";

export default function SalarySchedulePage() {
  const [activeTab, setActiveTab] = useState<"salary" | "audit">("salary");

  // LIFTED form state so Table can include them in payload
  const [effectivityDate, setEffectivityDate] = useState<string>("");
  const [nbcNo, setNbcNo] = useState<string>("");
  const [nbcDate, setNbcDate] = useState<string>("");
  const [eoNo, setEoNo] = useState<string>("");
  const [eoDate, setEoDate] = useState<string>("");

  return (
    <div className={modalStyles.Modal}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.mainTitle}>Salary Schedule</h2>
        </div>

        <div className={modalStyles.modalBody}>
          <div className={salaryScheduleStyle.SalarySchedule}>
            {/* --- Tabs Header --- */}
            <div className={salaryScheduleStyle.tabsHeader}>
              <button className={`${salaryScheduleStyle.tabButton} ${ activeTab === "salary" ? salaryScheduleStyle.active : ""}`}
                onClick={() => setActiveTab("salary")}>
                Salary Schedule
              </button>

              <button
                className={`${salaryScheduleStyle.tabButton} ${
                  activeTab === "audit" ? salaryScheduleStyle.active : ""
                }`}
                onClick={() => setActiveTab("audit")}
              >
                Audit Trail
              </button>
            </div>

            {/* --- Salary Schedule Tab --- */}
            {activeTab === "salary" && (
              <div className={salaryScheduleStyle.tabContent}>
                <SalaryScheduleForm
                  effectivityDate={effectivityDate}
                  setEffectivityDate={setEffectivityDate}
                  nbcNo={nbcNo}
                  setNbcNo={setNbcNo}
                  nbcDate={nbcDate}
                  setNbcDate={setNbcDate}
                  eoNo={eoNo}
                  setEoNo={setEoNo}
                  eoDate={eoDate}
                  setEoDate={setEoDate}
                />
                <SalaryScheduleTable
                  effectivityDate={effectivityDate}
                  nbcNo={nbcNo}
                  nbcDate={nbcDate}
                  eoNo={eoNo}
                  eoDate={eoDate}
                />
              </div>
            )}

            {/* --- Audit Trail Tab --- */}
            {activeTab === "audit" && (
              <div className={salaryScheduleStyle.tabContent}>
                <AuditTrailTable />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
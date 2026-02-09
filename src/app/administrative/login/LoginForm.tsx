"use client";

import React, { useEffect } from "react";
import styles from "@/styles/LoginForm.module.scss";
import InputFieldSetup from "../../../components/login/InputFieldSetup";
import ButtonSetup from "../../../components/login/SetupButton";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { AUTH_CONFIG } from "@/lib/utils/authConfig";
import { setCookie } from "@/lib/utils/cookies";
import { localStorageUtil } from "@/lib/utils/localStorageUtil";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL_HRM;

export default function AdminLoginPage() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const employeeNo = formData.get("employeeNo") as string;
      const employeePassword = formData.get("employeePassword") as string;

      // Call login API
      const response = await fetch(`${API_BASE_URL}/api/employee/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeNo, employeePassword }),
      });

      if (!response.ok) {
        Swal.fire({
          title: "Login failed!",
          text: "Incorrect username or password",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      // Store token
      const token = await response.text();
      localStorageUtil.set(token); //Store authToken

      // Set auth cookies and last activity
      // Set cookies and localStorage for session persistence
      const now = Date.now();
      const COOKIE_EXPIRY = AUTH_CONFIG.INACTIVITY_LIMIT; // in seconds

      setCookie(AUTH_CONFIG.COOKIE.IS_LOGGED_IN, "true", COOKIE_EXPIRY);
      setCookie(AUTH_CONFIG.COOKIE.LAST_ACTIVITY, now.toString(), COOKIE_EXPIRY);

      localStorage.setItem(AUTH_CONFIG.COOKIE.IS_LOGGED_IN, "true");
      localStorage.setItem(AUTH_CONFIG.COOKIE.LAST_ACTIVITY, now.toString());

      // Success alert and redirect
      Swal.fire({
        title: "Login Successfully!",
        text: "Press OK to proceed",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
        backdrop: true,
      }).then((result) => {
        if (result.isConfirmed) {
          router.replace("/administrative/dashboard");
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        title: "Login failed!",
        text: "Unreachable backend service",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  useEffect(() => {
    // Force light theme for login page
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.removeItem("theme");
  }, []);

  return (
    <form onSubmit={handleSubmit} className={styles.Login}>
      <div className={styles.loginImageInput}>
        <div className={styles.loginImage}>
          <Image
            src="/sti-icon.png"
            width={500}
            height={500}
            alt="Administrative Portal"
          />
        </div>
        <div className={styles.borderLeft}></div>
        <div className={styles.inputs}>
          <div className={styles.header}>
            <h2>Administrative Portal</h2>
          </div>
          <InputFieldSetup
            name="employeeNo"
            label="Employee No"
            inputType="text"
            id="emailId"
            required="true"
          />
          <InputFieldSetup
            name="employeePassword"
            label="Password"
            inputType="password"
            id="passwordId"
            required="true"
          />
          <ButtonSetup buttonType="submit" label="Sign In" />
          <ButtonSetup buttonType={undefined} label="Forgot Password?" />
          <div className={styles.horizontalLine}></div>
          <Link href={"/administrative/registration"}>
            <ButtonSetup buttonType="button" label="Sign Up" />
          </Link>
        </div>
      </div>
    </form>
  );
}
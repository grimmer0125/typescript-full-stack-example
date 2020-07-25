import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useForm } from "react-hook-form";
import { unwrapResult } from "@reduxjs/toolkit";

import styles from "./Account.module.css";
import { signup } from "./accountSlice";

export default function Signup() {
  const dispatch = useDispatch();
  const loginStatus = useSelector((state: any) => state.account.loginStatus);
  console.log("loginStatus:", loginStatus);
  // const error = useSelector((state) => state.posts.error);

  const { register, handleSubmit, watch, errors } = useForm();
  console.log("errors:", errors);
  const onSubmit = async (data: any) => {
    console.log("submit:", data);
    const resultAction = await dispatch(signup(data));
    console.log("after submit:", resultAction); // type: "user/signup/rejected",
    // unwrapResult(resultAction);
  };

  console.log(watch("example")); // watch input value by passing the name of it

  return (
    <div className={styles.form}>
      <div>
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          name="email"
          ref={register({
            required: "Enter your e-mail",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: "Enter a valid e-mail address",
            },
          })}
        />
      </div>
      <div>
        <label className={styles.label}>Password</label>
        <input
          className={styles.input}
          name="password"
          type="password"
          defaultValue=""
          ref={register}
        />
      </div>
      <div style={{ height: 50 }}>
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <button className={styles.button} onClick={handleSubmit(onSubmit)}>
          Signup
        </button>
      </div>
    </div>
  );
}

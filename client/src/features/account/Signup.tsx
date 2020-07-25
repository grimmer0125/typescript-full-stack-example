import React, { useState } from "react";
import { useForm } from "react-hook-form";

import styles from "./Account.module.css";

export default function Signup() {
  const { register, handleSubmit, watch, errors } = useForm();
  console.log("errors:", errors);
  const onSubmit = (data: any) => {
    console.log(data);
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

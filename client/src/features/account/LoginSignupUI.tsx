import React from "react";

import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import styles from "./Account.module.css";

// TODO: add typing on onSubmit
export interface LoginSignupProps {
  ifLoginUI: Boolean;
  onSubmit: any;
  msg: string;
}

export function LoginSignupUI(props: LoginSignupProps) {
  const { onSubmit, ifLoginUI, msg } = props;

  const { register, handleSubmit, watch, errors } = useForm();
  console.log("errors:", errors);

  console.log(watch("example")); // watch input value by passing the name of it

  let errMsg = "";
  let errUsername = errors?.username?.message;
  let errEmail = errors?.email?.message;
  let errPassword = errors?.password?.message;

  if (errUsername) {
    errMsg += errUsername + ",";
  }
  if (errEmail) {
    errMsg += errEmail + ",";
  }
  if (errPassword) {
    errMsg += errPassword + ",";
  }

  return (
    <div className={styles.form}>
      <div>
        <label className={styles.label}>Username</label>
        <input
          className={styles.input}
          name="username"
          ref={register({ required: "Enter your username" })}
        />
      </div>
      {ifLoginUI === false && (
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
      )}
      <div>
        <label className={styles.label}>Password</label>
        <input
          className={styles.input}
          name="password"
          type="password"
          defaultValue=""
          ref={register({ required: "Enter your password" })}
        />
      </div>
      <div style={{ height: 50 }}>{errMsg !== "" ? errMsg : msg}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button className={styles.button} onClick={handleSubmit(onSubmit)}>
            {ifLoginUI ? "Login" : "Signup"}
          </button>
        </div>
        <div>
          {ifLoginUI ? (
            <Link to="/signup">Signup</Link>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}

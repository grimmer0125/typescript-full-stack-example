import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { unwrapResult } from "@reduxjs/toolkit";
import { useHistory } from "react-router-dom";

import { login } from "./accountSlice";

import { LoginSignupUI } from "./LoginSignupUI";
import { RootState } from "../../app/store";

export default function Login() {
  let history = useHistory();
  const loginStatus = useSelector(
    (state: RootState) => state.account.loginStatus
  );

  const [msg, setMsg] = useState("");
  const dispatch = useDispatch();

  const onSubmit = async (data: any) => {
    // TODO: figure its typing later
    const resultAction = (await dispatch(login(data))) as any;

    console.log("after login submit, resultAction:", resultAction);

    const resp = unwrapResult(resultAction);
    console.log("unwrap result payload:", resp);
    // can use above unwrapResult instead
    if (resultAction?.payload?.access_token) {
      setMsg("login in successfully");
      history.push("/dashboard");
    }
  };

  return (
    <LoginSignupUI
      loginStatus={loginStatus}
      ifLoginUI={true}
      onSubmit={onSubmit}
      msg={msg}
    />
  );
}

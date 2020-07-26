import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { unwrapResult } from "@reduxjs/toolkit";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation,
} from "react-router-dom";

import { login } from "./accountSlice";

import { LoginSignupUI } from "./LoginSignupUI";

export default function Login() {
  let history = useHistory();

  const [msg, setMsg] = useState("");
  const dispatch = useDispatch();

  const onSubmit = async (data: any) => {
    // console.log("submit:", data);
    // TODO: figure its typing later
    const resultAction = (await dispatch(login(data))) as any;
    console.log("after submit:", resultAction);
    if (resultAction?.payload?.access_token) {
      setMsg("login in successfully");
      history.push("/dashboard");
    }
  };

  return <LoginSignupUI ifLoginUI={true} onSubmit={onSubmit} msg={msg} />;
}

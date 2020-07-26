import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { unwrapResult } from "@reduxjs/toolkit";
import { signup } from "./accountSlice";

import { LoginSignupUI } from "./LoginSignupUI";

export default function Login() {
  const [msg, setMsg] = useState("");

  const dispatch = useDispatch();

  // TODO: figure data & resultAction's typing later
  const onSubmit = async (data: any) => {
    console.log("submit:", data);
    const resultAction = (await dispatch(signup(data))) as any;
    console.log("after submit:", resultAction);
    if (resultAction?.payload?.email) {
      setMsg("sign in successfully");
    }
  };

  return <LoginSignupUI ifLoginUI={false} onSubmit={onSubmit} msg={msg} />;
}

import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { signup } from "./accountSlice";

import { LoginSignupUI } from "./LoginSignupUI";

/**
 * TODO: add signing up loading ui, like what we do in Login.tsx
 */
export default function SignupUI() {
  const [msg, setMsg] = useState("");

  const dispatch = useDispatch();

  // TODO: figure data & resultAction's typing later
  const onSubmit = async (data: any) => {
    const resultAction = (await dispatch(signup(data))) as any;
    if (resultAction?.payload?.email) {
      setMsg("sign up successfully");
    }
  };

  return <LoginSignupUI ifLoginUI={false} onSubmit={onSubmit} msg={msg} />;
}

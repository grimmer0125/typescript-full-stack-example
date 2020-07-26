import React, { useState, useEffect } from "react";

import { useApolloClient } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout } from "../account/accountSlice";

import { useHistory } from "react-router-dom";

export default function Dashboard() {
  let history = useHistory();
  const client = useApolloClient();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");

  const onLogout = async () => {
    const resultAction = (await dispatch(logout())) as any;
    history.push("/");
  };

  useEffect(() => {
    async function fetchData() {
      console.log("profile start query");
      const resultAction = (await dispatch(getProfile(client))) as any;
      console.log("profile result:", resultAction); // {payload:{data:{whoAmI:{id}}}
      const email = resultAction?.payload?.data.whoAmI?.email;
      if (email) {
        console.log("get profile sucessfully");
        setEmail(email);
      }
    }

    fetchData();

    //   effect
    return () => {
      //   cleanup
    };
  }, [client, dispatch]);

  return (
    <div
      style={{
        backgroundColor: "yellow",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "green",
          width: "100vw",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <h2>Dashboard:{`owner email:${email}`}</h2>
        <button onClick={onLogout}> logout</button>
      </div>
    </div>
  );
}

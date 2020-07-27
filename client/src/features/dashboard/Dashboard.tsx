import React, { useState, useEffect } from "react";

import { useApolloClient } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout } from "../account/accountSlice";
import { fetchRestaurants } from "./restaurantsSlice";

import { useHistory } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";

export default function Dashboard() {
  let history = useHistory();
  const client = useApolloClient();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");

  const onLogout = async () => {
    await dispatch(logout());
    history.push("/");
  };

  useEffect(() => {
    async function fetchData() {
      console.log("fetchRestaurants start query");
      const resultAction = (await dispatch(fetchRestaurants())) as any;
      console.log("fetchRestaurants result:", resultAction); // {payload:{data:{whoAmI:{id}}}
      const resp = unwrapResult(resultAction);
      console.log("unwrap result payload:", resp);
    }
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    async function fetchData() {
      console.log("profile start query");
      const resultAction = (await dispatch(getProfile())) as any;
      console.log("profile result:", resultAction); // {payload:{data:{whoAmI:{id}}}
      const email = resultAction?.payload?.data.whoAmI?.email;
      if (email) {
        console.log("get profile sucessfully");
        setEmail(email);
      }
    }
    fetchData();

    return () => {
      // cleanup
    };
  }, [client, dispatch]);

  return (
    <div
      style={{
        backgroundColor: "yellow",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
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
      <div
        style={{
          flex: 1,
          background: "red",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxHeight: "100%",
        }}
      >
        <div style={{ width: 600, height: 600, background: "white" }}></div>
      </div>
    </div>
  );
}

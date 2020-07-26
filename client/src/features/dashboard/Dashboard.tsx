import React, { useState, useEffect } from "react";

import { useApolloClient } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";

import { getProfile } from "../account/accountSlice";

export default function Dashboard() {
  const client = useApolloClient();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");

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

  return <h2>Dashboard:{`owner email:${email}`}</h2>;
}

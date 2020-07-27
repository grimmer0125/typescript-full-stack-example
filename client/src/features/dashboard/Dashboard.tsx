import React, { useState, useEffect } from "react";

import { useApolloClient } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout } from "../account/accountSlice";
import { fetchRestaurants } from "./restaurantsSlice";

import { useHistory } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { Loading, OpenTime } from "./restaurantsSlice";

/** copy from server side */
enum WeekDay {
  Mon = 1,
  Tues,
  Weds,
  Thurs,
  Fri,
  Sat,
  Sun,
  Thu, // = Thurs
  Wed, // = Weds
}

function convertOpenTimesToStr(openTimes: OpenTime[]) {
  return openTimes.map((openTime) => {
    const { weekDay, openHour, closeHour } = openTime;
    const weekDayStr = WeekDay[weekDay];
    return <>{`${weekDayStr} ${openHour}-${closeHour};`}</>;
  });
}

export default function Dashboard() {
  let history = useHistory();
  const client = useApolloClient();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");

  const restaurants = useSelector((state: RootState) => state.restaurants);
  const { total, status, perPage, error, page, ids, entities } = restaurants;
  let totalPage = Math.ceil(total / perPage);

  const onLogout = async () => {
    await dispatch(logout());
    history.push("/");
  };

  useEffect(() => {
    async function fetchData() {
      console.log("fetchRestaurants start query");
      const resultAction = (await dispatch(fetchRestaurants(page))) as any;
      console.log("fetchRestaurants result:", resultAction); // {payload:{data:{whoAmI:{id}}}
      const resp = unwrapResult(resultAction);
      console.log("unwrap result payload:", resp);
    }
    fetchData();
  }, [dispatch, page]);

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

  let content;
  if (status === Loading.Pending) {
    content = <div>Loading...</div>;
  } else if (status === Loading.Succeeded) {
    // show restaurants
    // export const selectAllPosts = state => state.posts.posts
    content = ids.map((restaurantID) => {
      const restaurant = entities[restaurantID];
      if (!restaurant) {
        return <></>;
      }
      const { name, openTimes } = restaurant;
      return (
        <div
          key={restaurantID}
          style={{
            backgroundColor: "grey",
            margin: "10px 10px",
            display: "flex",
          }}
        >
          <div>{restaurant?.name}</div>
          <div>{openTimes && convertOpenTimesToStr(openTimes)}</div>
        </div>
      );
    });
  } else if (status === Loading.Failed) {
    content = <div>{error}</div>;
  }

  const onNextClick = async (data: any) => {
    if (page + 1 <= totalPage) {
      await dispatch(fetchRestaurants(page + 1));
    }
  };

  const onPreClick = async (data: any) => {
    if (page > 1) {
      await dispatch(fetchRestaurants(page - 1));
    }
  };

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
        Restaurants:
        <div style={{ width: 800, height: 800, background: "white" }}>
          {content}
        </div>
        <div>
          Total:{total}
          <button onClick={onPreClick}>{"<"}</button>
          <button onClick={onNextClick}>{">"}</button>
          page: {`${page}/${totalPage}`}
        </div>
      </div>
    </div>
  );
}

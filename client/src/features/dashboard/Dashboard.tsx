import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";

import { getProfile, logout } from "../account/accountSlice";
import { fetchRestaurants } from "./restaurantsSlice";
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
  // const { register, handleSubmit, watch, errors } = useForm();

  let history = useHistory();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [timeText, setTimeText] = useState("");
  const [weekDay, setWeekDay] = useState(0);
  const [msg, setMsg] = useState("");
  const [restaurantFilterName, setRestaurantFilterName] = useState("");

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
      const resultAction = (await dispatch(
        fetchRestaurants({ newPage: 1 })
      )) as any;
      console.log("fetchRestaurants result:", resultAction); // {payload:{data:{whoAmI:{id}}}
      const resp = unwrapResult(resultAction);
      console.log("unwrap result payload:", resp);
    }
    fetchData();
  }, [dispatch]); // if add page, will retrigger

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
  }, [dispatch]);

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
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: "#7FC8FF",
            margin: "10px 10px",
            display: "flex",
          }}
        >
          <div style={{ margin: "5px" }}>{restaurantID}</div>
          <div style={{ margin: "5px", width: 250 }}>{restaurant?.name}</div>
          <div style={{ margin: "5px" }}>
            {openTimes && convertOpenTimesToStr(openTimes)}
          </div>
        </div>
      );
    });
  } else if (status === Loading.Failed) {
    content = <div>{error}</div>;
  }

  const onNextClick = async (data: any) => {
    if (page + 1 <= totalPage) {
      await dispatch(
        fetchRestaurants({
          newPage: page + 1,
          filterWeekDay: weekDay,
          filterTime: timeText,
          filterRestaurentName: restaurantFilterName,
        })
      );
    }
  };

  const onPreClick = async (data: any) => {
    if (page > 1) {
      await dispatch(
        fetchRestaurants({
          newPage: page - 1,
          filterWeekDay: weekDay,
          filterTime: timeText,
          filterRestaurentName: restaurantFilterName,
        })
      );
    }
  };

  const handleWeekDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("day:", event.target.value);
    setWeekDay(parseInt(event.target.value));
  };
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("time:", event);
    setTimeText(event.target.value);
  };

  //   const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log("time:", event);
  //   setTimeText(event.target.value);
  // };
  const handleRestaurantNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("RestaurantName:", event);
    setRestaurantFilterName(event.target.value);
  };

  const onFilterSubmit = async (data: any) => {
    let weekDayFilterOK = false;
    let timeFilterOK = false;
    let restaurantFilterOK = false;
    let errorMsg = "";

    if (weekDay > 0) {
      weekDayFilterOK = true;
    }

    if (restaurantFilterName) {
      restaurantFilterOK = true;
    }

    if (timeText) {
      const strings = timeText.split(":");
      if (strings.length !== 3) {
        errorMsg = "not valid timeText";
      } else {
        const hour = parseInt(strings[0]);
        if (isNaN(hour) || hour > 24 || hour < 0) {
          errorMsg = "not valid hour";
        }
        const min = parseInt(strings[1]);
        if (isNaN(min) || min > 59 || min < 0) {
          errorMsg = "not valid min";
        }
        const second = parseInt(strings[2]);
        if (isNaN(second) || second > 59 || second < 0) {
          errorMsg = "not valid second";
        }
      }
      timeFilterOK = true;
    } else {
      errorMsg = "not enough weekDay&time";
    }

    if (timeFilterOK || restaurantFilterOK || weekDayFilterOK) {
      if (errorMsg) {
        errorMsg += "other ok, submitted";
      }

      await dispatch(
        fetchRestaurants({
          newPage: 1,
          issueFilter: true,
          filterWeekDay: weekDay,
          filterTime: timeText,
          filterRestaurentName: restaurantFilterName,
        })
      );
    }
    if (errorMsg) {
      setMsg(errorMsg);
    }
  };

  return (
    <div
      style={{
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
        <h2>Restaurants Dashboard:{`owner:${email}`}</h2>
        <button onClick={onLogout}> logout</button>
      </div>
      <div
        style={{
          flex: 1,
          background: "#33FFDD",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex" }}>
          <div>
            WeekDayTime:
            <select value={weekDay} onChange={handleWeekDayChange}>
              <option value={0}>{""}</option>
              <option value={WeekDay.Mon}>Mon</option>
              <option value={WeekDay.Tues}>Tues</option>
              <option value={WeekDay.Weds}>Weds</option>
              <option value={WeekDay.Thurs}>Thurs</option>
              <option value={WeekDay.Fri}>Fri</option>
              <option value={WeekDay.Sat}>Sat</option>
              <option value={WeekDay.Sun}>Sun</option>
            </select>
            <input
              onChange={handleTimeChange}
              value={timeText}
              placeholder="e.g. 11:11:11"
            />
            Restaurent Name:
            <input
              onChange={handleRestaurantNameChange}
              value={restaurantFilterName}
              placeholder="e.g. apple store"
            />
            <button onClick={onFilterSubmit}>Filter</button>
            {msg}
          </div>
        </div>
        <div style={{ width: 800, background: "white", overflow: "auto" }}>
          {content}
        </div>
        <div>
          Total:{total === Infinity ? "..." : total}
          <button onClick={onPreClick}>{"<"}</button>
          <button onClick={onNextClick}>{">"}</button>
          page: {`${page}/${totalPage === Infinity ? "..." : totalPage}`}
        </div>
      </div>
    </div>
  );
}

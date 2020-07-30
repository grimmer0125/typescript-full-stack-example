import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { unwrapResult } from "@reduxjs/toolkit";

import { Link } from "react-router-dom";

import { getProfile, logout } from "../account/accountSlice";
import { fetchRestaurants } from "./restaurantsSlice";

import { RootState } from "../../app/store";
import { Loading } from "./restaurantsSlice";
import RestaurantBlock, { WeekDay } from "./RestaurantBlock";

export default function Dashboard() {
  let history = useHistory();
  const dispatch = useDispatch();
  const [timeText, setTimeText] = useState("");
  const [weekDay, setWeekDay] = useState(0);
  const [msg, setMsg] = useState("");
  const [restaurantFilterName, setRestaurantFilterName] = useState("");
  const [selectedRestaurantID, setSelectedRestaurantID] = useState(0);

  const email = useSelector((state: RootState) => state.account.email);

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
  }, [dispatch]);

  useEffect(() => {
    async function fetchData() {
      console.log("profile start query");
      const resultAction = (await dispatch(getProfile())) as any;
      console.log("profile result:", resultAction); // {payload:{data:{whoAmI:{id}}}
      // const email = resultAction?.payload?.data.whoAmI?.email;
      // if (email) {
      //   console.log("get profile sucessfully");
      //   setEmail(email);
      // }
    }
    fetchData();

    return () => {
      // cleanup
    };
  }, [dispatch]);

  const onRestaurantClick = (restaurantID: number) => {
    console.log("onRestaurantClick:", restaurantID);
    setSelectedRestaurantID(restaurantID);
  };

  const unselectRestaurant = () => {
    console.log("unselectRestaurant");
    setSelectedRestaurantID(0);
  };

  let content;
  if (status === Loading.Pending) {
    content = <div>Loading...</div>;
  } else if (status === Loading.Succeeded) {
    // show restaurants
    content = ids.map((restaurantID) => {
      const restaurant = entities[restaurantID];
      if (restaurant) {
        return (
          <RestaurantBlock
            key={restaurant.id}
            restaurant={restaurant}
            // onRestaurantClick={onRestaurantClick}
            // unselectRestaurant={unselectRestaurant}
            // open={restaurant.id === selectedRestaurantID ? true : false}
          />
        );
      } else {
        return <></>;
      }
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
      if (!errorMsg) {
        timeFilterOK = true;
      }
    }

    if (timeFilterOK || restaurantFilterOK || weekDayFilterOK) {
      if (errorMsg) {
        errorMsg += ", submitted others";
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
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Restaurants Dashboard</h2>
          <div style={{ margin: "10px" }}>
            <Link to="/collection">Collection</Link>
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <h2>{`${email}`}</h2>
          <button onClick={onLogout}> logout</button>
        </div>
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
              style={{ width: 75 }}
              onChange={handleTimeChange}
              value={timeText}
              placeholder="e.g. 11:11:11"
            />
            Restaurent Name:
            <input
              style={{ width: 110 }}
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

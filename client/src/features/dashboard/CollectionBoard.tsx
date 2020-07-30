import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Popup from "reactjs-popup";
import { getProfile, logout } from "../account/accountSlice";

import { RootState } from "../../app/store";
import {
  fetchRestaurantCollectionsInCollectionUI,
  fetchRestaurantCollectionContent,
  shareRestaurantCollection,
} from "./restaurantsCollectionsSlice";
import RestaurantBlock from "./RestaurantBlock";

export function CollectionBoardContent() {
  const dispatch = useDispatch();
  const [shareTarget, setShareTarget] = useState("");

  useEffect(() => {
    async function fetchData() {
      console.log("fetch fetchRestaurantCollections");
      dispatch(fetchRestaurantCollectionsInCollectionUI({}));
    }
    fetchData();
  }, [dispatch]);

  const restaurantCollections = useSelector(
    (state: RootState) => state.restaurantCollections
  );
  const {
    ids,
    entities,
    selectedRestaurantCollectionID,
  } = restaurantCollections;

  const onSelectCollection = (restaurantCollectionID: number) => {
    console.log("select restaurantCollectionID:", restaurantCollectionID);

    dispatch(fetchRestaurantCollectionContent({ restaurantCollectionID }));
  };

  const shareTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShareTarget(event.target.value);
  };

  const onShareSubmit = (restaurantCollectionID: number, close: any) => {
    if (shareTarget) {
      dispatch(
        shareRestaurantCollection({
          restaurantCollectionID,
          targetEamil: shareTarget,
        })
      );
      close();
    }
  };

  const collectionContent = ids.map((restaurantCollectionID) => {
    const restaurantCollection = entities[restaurantCollectionID];
    if (restaurantCollection) {
      let style = {
        display: "flex",
        width: "200px",
        height: "65px",
        margin: "10px 10px",
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: "#7FC8FF",
        justifyContent: "space-between",
      };
      if (selectedRestaurantCollectionID === restaurantCollectionID) {
        style = { ...style, borderColor: "blue" };
      }
      return (
        <div
          onClick={() => onSelectCollection(restaurantCollectionID as number)}
          key={restaurantCollection.id}
          style={style}
        >
          <div>{restaurantCollection.name}</div>
          <Popup trigger={<button>Share</button>} position="top left">
            {(close) => (
              <div>
                Share to others (email address):
                <input
                  style={{ width: 110 }}
                  onChange={shareTextChange}
                  value={shareTarget}
                  placeholder="e.g. apple@apple.com"
                />
                <button
                  onClick={() => onShareSubmit(restaurantCollection.id, close)}
                >
                  submit
                </button>
              </div>
            )}
          </Popup>
        </div>
      );
    } else {
      return <></>;
    }
  });

  let restaurantContent;
  if (entities[selectedRestaurantCollectionID]) {
    const restaurantCollection = entities[selectedRestaurantCollectionID];
    if (restaurantCollection) {
      const { restaurants } = restaurantCollection;
      if (restaurants) {
        restaurantContent = restaurants.map((restaurant) => {
          return (
            <RestaurantBlock
              key={restaurant.id}
              restaurant={restaurant}
              noAddButton={true}
              // onRestaurantClick={onRestaurantClick}
              // unselectRestaurant={unselectRestaurant}
              // open={restaurant.id === selectedRestaurantID ? true : false}
            />
          );
        });
      }
    }
  }
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        Collection List
        {collectionContent}
      </div>
      <div style={{ flex: 1 }}>
        Restaurant List
        {restaurantContent}
      </div>
    </div>
  );
}

export default function CollectionBoard() {
  const email = useSelector((state: RootState) => state.account.email);
  let history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData() {
      dispatch(getProfile());
    }
    fetchData();
  }, [dispatch]);

  const onLogout = async () => {
    await dispatch(logout());
    history.push("/");
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
            <Link to="/dashboard">Dashboard</Link>
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
          {/* a top horizontal row */}
          Title
        </div>
        <div style={{ width: 800, background: "white", overflow: "auto" }}>
          <CollectionBoardContent />
        </div>
        <div>
          {/* a bottom horizontal row */}
          {/* Total:{total === Infinity ? "..." : total}
              <button onClick={onPreClick}>{"<"}</button>
              <button onClick={onNextClick}>{">"}</button>
              page: {`${page}/${totalPage === Infinity ? "..." : totalPage}`} */}
        </div>
      </div>
    </div>
  );
}

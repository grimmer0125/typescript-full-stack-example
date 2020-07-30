import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Popup from "reactjs-popup";

import { Restaurant } from "./restaurantsSlice";
import {
  addRestaurantToCollection,
  fetchRestaurantCollections,
} from "./restaurantsCollectionsSlice";
import { RootState } from "../../app/store";
import { OpenTime } from "./restaurantsSlice";

/** copy from server side */
export enum WeekDay {
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
  let totalStr = "";
  openTimes.forEach((openTime) => {
    const { weekDay, openHour, closeHour } = openTime;
    const weekDayStr = WeekDay[weekDay];
    totalStr += `${weekDayStr} ${openHour}-${closeHour};`;
  });
  return totalStr;
}

interface RestaurantBlockProps {
  restaurant: Restaurant;
  onRestaurantClick?: any;
  unselectRestaurant?: any;
  open?: boolean;
  noAddButton?: boolean;
}

export default function RestaurantBlock(props: RestaurantBlockProps) {
  const { restaurant, noAddButton } = props;
  const [open, setOpen] = useState(false);
  const [selectedCollectionName, setSelectedCollectionName] = useState("");

  const dispatch = useDispatch();
  const restaurantCollections = useSelector(
    (state: RootState) => state.restaurantCollections
  );
  const { ids, entities } = restaurantCollections;

  useEffect(() => {
    async function fetchData() {
      dispatch(fetchRestaurantCollections({}));
    }
    if (open === true) {
      fetchData();
    }
  }, [dispatch, open, setOpen]);

  const onOepn = (open: boolean) => {
    // workaround solution, otherwise will get warning
    setTimeout(() => {
      setOpen(open);
    }, 1);
  };
  if (!restaurant) {
    return <></>;
  }

  const onSelectCollection = (restaurantCollectionID: number) => {
    const restaurantCollection = entities[restaurantCollectionID];
    if (restaurantCollection) {
      setSelectedCollectionName(restaurantCollection.name);
    }
  };

  const handleRestaurantCollectionNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedCollectionName(event.target.value);
  };
  const onSubmit = async () => {
    await dispatch(
      addRestaurantToCollection({
        restaurantName: restaurant.name,
        restaurantCollectionName: selectedCollectionName,
      })
    );
  };

  let addRestaurantContent = null;
  if (open) {
    const collectionContent = ids.map((restaurantCollectionID) => {
      const restaurantCollection = entities[restaurantCollectionID];
      if (restaurantCollection) {
        return (
          <div
            onClick={() => onSelectCollection(restaurantCollectionID as number)}
            key={restaurantCollection.id}
          >
            {restaurantCollection.name}
          </div>
        );
      } else {
        return <></>;
      }
    });

    addRestaurantContent = (
      <div>
        Choose a favorite list or create one to add in:
        <input
          style={{ width: 110 }}
          onChange={handleRestaurantCollectionNameChange}
          value={selectedCollectionName}
          placeholder="e.g. fav list 1"
        />
        <button onClick={onSubmit}>submit</button>
        {collectionContent}
      </div>
    );
  } else {
    addRestaurantContent = <div></div>;
  }

  const { openTimes } = restaurant;
  return (
    <div
      style={{
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: "#7FC8FF",
        margin: "10px 10px",
        display: "flex",
        height: "65 px",
      }}
    >
      <div style={{ margin: "5px" }}>{restaurant.id}</div>
      <div style={{ margin: "5px", width: 250 }}>{restaurant?.name}</div>
      <div style={{ margin: "5px" }}>
        {openTimes && convertOpenTimesToStr(openTimes)}
      </div>
      {!noAddButton && (
        <div>
          <Popup
            trigger={(open) => {
              onOepn(open);
              return <button>+</button>;
            }}
            position="right center"
            closeOnDocumentClick
          >
            {addRestaurantContent}
          </Popup>
          {/* below works (controlled by others) but its position is not right center */}
          {/* <button onClick={() => onRestaurantClick(restaurant.id)}>+</button>
          <Popup
            open={open}
            closeOnDocumentClick
            onClose={unselectRestaurant}
            position="right center"
          >
            <span> Popup content </span>
          </Popup> */}
        </div>
      )}
    </div>
  );
}

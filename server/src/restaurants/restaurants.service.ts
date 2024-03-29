import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Restaurant } from './models/restaurant.model';
import { OpenTime } from './models/opentime.model';

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

function convertWeekStrToEnum(weekDay: string) {
  const weekDayEnum: WeekDay = WeekDay[weekDay as string];
  if (weekDayEnum === WeekDay.Thu) {
    return WeekDay.Thurs;
  } else if (weekDayEnum === WeekDay.Wed) {
    return WeekDay.Weds;
  }
  return weekDayEnum;
}

function convertTimeStrToDBStandard(time: string) {
  const hourMinute = time.substring(0, time.length - 3);
  const timeList = hourMinute.split(':');
  let hourStr = timeList[0];
  let hour = parseInt(hourStr);
  let minuteStr;
  if (timeList.length > 1) {
    minuteStr = timeList[1];
  } else {
    minuteStr = '00';
  }
  const amPm = time.substring(time.length - 2, time.length);
  if (amPm === 'pm') {
    if (hour !== 12) {
      hour += 12;
    }
    hourStr = hour.toString();
  } else if (hour < 10) {
    hourStr = '0' + hourStr;
  } else if (hour === 12) {
    hourStr = '00';
  }
  const finalStr = hourStr + ':' + minuteStr + ':00';
  return finalStr;
}

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    @InjectRepository(OpenTime)
    private openTimesRepository: Repository<OpenTime>,
  ) {}

  // deprecated
  async findRestaurantsByFilterName(
    perPage: number,
    page: number,
    filterRestaurentName: string,
  ) {
    const restaurants = await this.restaurantsRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.openTimes', 'openTime')
      .where('restaurant.name like :name', {
        name: '%' + filterRestaurentName + '%',
      })
      .orderBy('restaurant.name')
      .skip(0)
      .take(50)
      .getMany();

    return {
      restaurants,
      total: 0, // dummy
    };
  }

  async findRestaurantsByFilter(
    perPage: number,
    page: number,
    filterWeekDay: number,
    filterTime: string,
    filterRestaurentName: string,
  ) {
    const skip = (page - 1) * perPage;

    const queryList = [];
    if (filterRestaurentName) {
      const restaurentSQL = ` "restaurant"."name" ILIKE '%${filterRestaurentName}%' `;
      queryList.push(restaurentSQL);
    }
    if (filterWeekDay) {
      const weekDaySQL = ` "open_time"."weekDay" = ${filterWeekDay} `;
      queryList.push(weekDaySQL);
    }
    if (filterTime) {
      const timeSQL = ` "open_time"."openHour" <= '${filterTime}' AND ('${filterTime}' < "open_time"."closeHour" OR "open_time"."openHour" >= "open_time"."closeHour") `;
      queryList.push(timeSQL);
    }
    let queryStr = '';
    for (let i = 0; i < queryList.length; i++) {
      if (i === 0) {
        queryStr += 'WHERE ';
      } else {
        queryStr += 'AND ';
      }
      queryStr += queryList[i];
    }

    const openTimeList = await this.openTimesRepository.query(
      `SELECT DISTINCT ON ("open_time"."restaurantId") "open_time".*, "restaurant".* FROM open_time 
        LEFT JOIN restaurant ON "restaurant"."id" = "open_time"."restaurantId"
        ${queryStr}
        ORDER BY "open_time"."restaurantId"
        LIMIT ${perPage} OFFSET ${skip}`,
    );

    if (openTimeList.length === 0) {
      return {
        restaurants: [],
        total: 0,
      };
    }

    /**
     * prevent n-query issue
     */
    const ids = openTimeList.map(openTime => {
      return openTime.restaurantId;
    });
    const restaurants = await this.restaurantsRepository.find({
      where: {
        id: In(ids),
      },
      relations: ['openTimes'],
    });

    return {
      restaurants,
      total: 0, // dummy
    };
  }

  async findRestaurants(perPage: number, page: number) {
    const data = await this.restaurantsRepository.findAndCount({
      order: {
        id: 'ASC',
      },
      skip: (page - 1) * perPage,
      take: perPage,
      relations: ['openTimes'],
    });

    const [restaurants, total] = data;
    return {
      total,
      restaurants,
    };
  }

  //** TODO: speed up the performance instead of write one by one*/
  async batchUpsert(data: string): Promise<Restaurant[]> {
    console.log('batchUpsert start');
    let totalRestaurant = 0;
    let totalTimeObj = 0;
    /** To check if any restaurant duplicate, should not happen */
    const restaurantDict = {};

    const dataArray = data.split(/"\r?\n/);
    for (let i = 0; i < dataArray.length; i++) {
      totalRestaurant += 1;
      const restaurantData = dataArray[i];
      const fieldData = restaurantData.split('","');
      const restaurantName = fieldData[0].substring(1);
      if (restaurantDict[restaurantName]) {
        // TODO: delete old and use new, currently just skip new one
        // e.g.
        // 'Parallel 37',
        // 'Smyth',
        // 'Rafain Brazilian Steakhouse'
        // 'Bones'
        // 'Blue Plate'
        // 'Lena'
        // 'Town'
        // 'Pappas Bros. Steakhouse'
        // 'The Grove'
        // 'The Kitchen'
        // 'Prime Steakhouse'
        console.error(
          `duplicate restaurant record, should not happen:${restaurantName}`,
        );
        continue;
      }
      restaurantDict[restaurantName] = 1;
      const restaurantObj = new Restaurant();
      restaurantObj.name = restaurantName;
      await this.restaurantsRepository.save(restaurantObj);
      console.log(`save ${totalRestaurant} Restaurant`);
      const openTimeArrayStr = fieldData[1];
      const weekDayTimeList = openTimeArrayStr.split(' / ');

      // remove tail " for last one
      if (i === dataArray.length - 1) {
        const tail = weekDayTimeList[weekDayTimeList.length - 1];
        weekDayTimeList[weekDayTimeList.length - 1] = tail.substring(
          0,
          tail.length - 1,
        );
      }

      const sortingOpenTimeList: OpenTime[] = [];
      for (let index = 0; index < weekDayTimeList.length; index++) {
        // may have space tail, e.g. e.g. 9 pm '
        const weekDayTimeStr = weekDayTimeList[index].trim();

        const firstDigit = weekDayTimeStr.search(/\d/);
        const weekDayStr = weekDayTimeStr.substring(0, firstDigit - 1);
        // might multiple day. Mon or Tues - Weds, Fri, Sat - Sun, Sun - Mon
        const timeStr = weekDayTimeStr.substring(
          firstDigit,
          weekDayTimeStr.length,
        );
        /**
         * handle weekDay part
         */
        const weekDayCandidateList: number[] = [];
        weekDayStr.split(', ').forEach(weekDayCommaStr => {
          const weekDays = weekDayCommaStr.split('-'); // or " - "
          if (weekDays.length === 1) {
            // just one day;
            const weekDay: WeekDay = convertWeekStrToEnum(weekDays[0]);
            weekDayCandidateList.push(weekDay);
          } else if (weekDays.length == 2) {
            const start = weekDays[0].trim();
            const weekDayStart: WeekDay = convertWeekStrToEnum(start);
            const end = weekDays[1].trim();

            const weekDayEnd: WeekDay = convertWeekStrToEnum(end);
            let cursor = weekDayStart;
            while (true) {
              if (cursor > WeekDay.Sun) {
                cursor = WeekDay.Mon;
              }
              weekDayCandidateList.push(cursor);
              if (cursor === weekDayEnd) {
                break;
              }
              cursor += 1;
            }
          } else {
            throw new Error('not valid:' + weekDays);
          }
        });
        /**
         * handle time part, e.g. 1:15 pm - 2:45 pm
         */
        const timeList = timeStr.split(' - ');
        const openHour = convertTimeStrToDBStandard(timeList[0]);
        const closeHour = convertTimeStrToDBStandard(timeList[1]);
        /**
         * save to DB
         */
        for (const weekDay of weekDayCandidateList) {
          totalTimeObj += 1;
          console.log(`save ${totalTimeObj} timeObj into db`);
          const timeObj = new OpenTime();
          timeObj.openHour = openHour;
          timeObj.closeHour = closeHour;
          timeObj.weekDay = weekDay;
          timeObj.restaurant = restaurantObj;
          sortingOpenTimeList.push(timeObj);
        }
      }

      sortingOpenTimeList.sort((a, b) => {
        return a.weekDay - b.weekDay;
      });
      for (const timeObj of sortingOpenTimeList) {
        await this.openTimesRepository.save(timeObj);
      }
    }

    console.log('batchUpsert end');

    return [];
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  if (finalStr === '09 :00:00') {
    console.log('bingo');
  }
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

  //** TODO: speed up the performance instead of write one by one*/
  async batchUpsert(data: string): Promise<Restaurant[]> {
    console.log('batchUpsert start');
    let totalRestaurant = 0;
    let totalTimeObj = 0;
    /** To check if any restaurant duplicate, should not happen */
    const restaurantDict = {};

    // /" is to remove tail ", but last one still has tail "
    const dataArray = data.split(/"\r?\n/);
    for (let i = 0; i < dataArray.length; i++) {
      totalRestaurant += 1;
      const restaurantData = dataArray[i];
      const fieldData = restaurantData.split('","');
      const restaurantName = fieldData[0].substring(1);
      if (restaurantDict[restaurantName]) {
        // TODO: delete old and use new, currently just skip new one
        // e.g. "Parallel 37", "Smyth", 'Rafain Brazilian Steakhouse'
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
      // Mon 10 am - 11 am / Tues - Weds, Fri 1:15 pm - 2:45 pm
      // console.log('restaurant has number of opening hours:', weekDayTimeList.length);
      // weekDayTimeList = weekDayTimeList.concat(openTimeArray);

      // remove tail " for last one
      if (i === dataArray.length - 1) {
        const tail = weekDayTimeList[weekDayTimeList.length - 1];
        weekDayTimeList[weekDayTimeList.length - 1] = tail.substring(
          0,
          tail.length - 1,
        );
      }

      for (let index = 0; index < weekDayTimeList.length; index++) {
        // may have space tail, e.g. e.g. 9 pm '
        const weekDayTimeStr = weekDayTimeList[index].trim();
        console.log('index:', index, weekDayTimeStr);
        if (index !== 0 && index !== weekDayTimeList.length - 1) {
          continue;
        }

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
            const weekDay: WeekDay = convertWeekStrToEnum(weekDays[0]); // WeekDay[ as string];
            weekDayCandidateList.push(weekDay);
            // just one day;
          } else if (weekDays.length == 2) {
            const start = weekDays[0].trim();
            const weekDayStart: WeekDay = convertWeekStrToEnum(start); //WeekDay[start as string];
            const end = weekDays[1].trim();

            const weekDayEnd: WeekDay = convertWeekStrToEnum(end); //WeekDay[end as string];
            let cursor = weekDayStart;
            if (!end) {
              console.log('strange');
            }
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
        // console.log('save to db:', weekDayCandidateList.length, index);
        for (const weekDay of weekDayCandidateList) {
          totalTimeObj += 1;
          console.log(`save ${totalTimeObj} timeObj into db`);
          const timeObj = new OpenTime();
          timeObj.openHour = openHour;
          timeObj.closeHour = closeHour;
          timeObj.weekDay = weekDay;
          timeObj.restaurant = restaurantObj;
          // NOTE: change to batch save?
          await this.openTimesRepository.save(timeObj);
        }
      }
    }

    console.log('batchUpsert end');

    return [];
  }
}

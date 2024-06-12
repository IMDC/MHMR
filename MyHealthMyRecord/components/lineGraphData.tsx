function accessFreqMaps(freqMaps: any) {
  let temp = freqMaps;
  let result = [];
  for (let i = 0; i < temp.length; i++) {
    result.push(temp[i].map);
  }
  return result;
}

// base template for how to format each day
let freqDayTemplate = [
  {
    label: 0,
    value: 0,
    videoIDs: [],
  },
  {
    label: 1,
    value: 0,
    videoIDs: [],
  },
  {
    label: 2,
    value: 0,
    videoIDs: [],
  },
  {
    label: 3,
    value: 0,
    videoIDs: [],
  },
  {
    label: 4,
    value: 0,
    videoIDs: [],
  },
  {
    label: 5,
    value: 0,
    videoIDs: [],
  },
  {
    label: 6,
    value: 0,
    videoIDs: [],
  },
  {
    label: 7,
    value: 0,
    videoIDs: [],
  },
  {
    label: 8,
    value: 0,
    videoIDs: [],
  },
  {
    label: 9,
    value: 0,
    videoIDs: [],
  },
  {
    label: 10,
    value: 0,
    videoIDs: [],
  },
  {
    label: 11,
    value: 0,
    videoIDs: [],
  },
  {
    label: 12,
    value: 0,
    videoIDs: [],
  },
  {
    label: 13,
    value: 0,
    videoIDs: [],
  },
  {
    label: 14,
    value: 0,
    videoIDs: [],
  },
  {
    label: 15,
    value: 0,
    videoIDs: [],
  },
  {
    label: 16,
    value: 0,
    videoIDs: [],
  },
  {
    label: 17,
    value: 0,
    videoIDs: [],
  },
  {
    label: 18,
    value: 0,
    videoIDs: [],
  },
  {
    label: 19,
    value: 0,
    videoIDs: [],
  },
  {
    label: 20,
    value: 0,
    videoIDs: [],
  },
  {
    label: 21,
    value: 0,
    videoIDs: [],
  },
  {
    label: 22,
    value: 0,
    videoIDs: [],
  },
  {
    label: 23,
    value: 0,
    videoIDs: [],
  },
];

let freqWeekTemplate = [
  {
    label: 0,
    value: 0,
    videoIDs: [],
  },
  {
    label: 1,
    value: 0,
    videoIDs: [],
  },
  {
    label: 2,
    value: 0,
    videoIDs: [],
  },
  {
    label: 3,
    value: 0,
    videoIDs: [],
  },
  {
    label: 4,
    value: 0,
    videoIDs: [],
  },
  {
    label: 5,
    value: 0,
    videoIDs: [],
  },
  {
    label: 6,
    value: 0,
    videoIDs: [],
  },
];

let freqMonthTemplate = [
  {
    label: 0,
    value: 0,
    videoIDs: [],
  },
  {
    label: 1,
    value: 0,
    videoIDs: [],
  },
  {
    label: 2,
    value: 0,
    videoIDs: [],
  },
  {
    label: 3,
    value: 0,
    videoIDs: [],
  },
  {
    label: 4,
    value: 0,
    videoIDs: [],
  },
  {
    label: 5,
    value: 0,
    videoIDs: [],
  },
  {
    label: 6,
    value: 0,
    videoIDs: [],
  },
  {
    label: 7,
    value: 0,
    videoIDs: [],
  },
  {
    label: 8,
    value: 0,
    videoIDs: [],
  },
  {
    label: 9,
    value: 0,
    videoIDs: [],
  },
  {
    label: 10,
    value: 0,
    videoIDs: [],
  },
  {
    label: 11,
    value: 0,
    videoIDs: [],
  },
];

export function useSetLineGraphData() {
  const setLineGraphData = (freqMaps: any, word: string) => {
    let maps = accessFreqMaps(freqMaps);

    let trackedDatesForHours = new Map();
    let trackedHours = new Map();
    let trackedDatesForWeeks = new Map();
    let trackedWeeks = new Map();
    let trackedDatesForMonths = new Map();
    let trackedMonths = new Map();

    let saveDate = '';
    let date = '';
    let weekDate = '';
    let monthDate = '';
    let yearDate = '';
    let hour = 0;
    let week = 0;
    let month = 0;
    let year = 0;

    let resultsDatesForHours = [];
    let resultByHour = [];
    let resultsDatesForWeeks = [];
    let resultByWeek = [];
    let resultsDatesForMonths = [];
    let resultByMonth = [];
    let resultsDatesForYears = [];
    let resultByYear = [];

    for (let i = 0; i < freqMaps.length; i++) {
      saveDate = freqMaps[i].datetime.toString().split(' ');
      // ex. result of above: Array ["Mon", "Apr", "29", "2024", "13:05:26", "GMT-0400", "(Eastern", "Daylight", "Time)"]
      date =
        saveDate[0] + ' ' + saveDate[1] + ' ' + saveDate[2] + ' ' + saveDate[3];
      // result of above: "Mon Apr 29 2024"
      monthDate = saveDate[1] + ' ' + saveDate[3];
      // result of above: "Apr 2024"

      yearDate = saveDate[3];
      // result of above: "2024"

      hour = freqMaps[i].datetime.getHours();
      // result of above: 13
      // week = freqMaps[i].datetime.getWeek();
      // result of above: 18
      month = freqMaps[i].datetime.getMonth();
      // result of above: 3
      year = freqMaps[i].datetime.getFullYear();
      // result of above: 2024

      // if word is in the map, then...
      if (freqMaps[i].map.has(word)) {
        // if new day, then...
        if (!trackedDatesForHours.has(date)) {
          trackedDatesForHours.set(date, 1);
          // refresh tracked hours for a new day
          [...trackedHours.keys()].forEach(key => {
            trackedHours.set(key, 0);
            console.log('reset key ', key);
          });
          // need to reset template data
          freqDayTemplate = [
            {
              label: 0,
              value: 0,
              videoIDs: [],
            },
            {
              label: 1,
              value: 0,
              videoIDs: [],
            },
            {
              label: 2,
              value: 0,
              videoIDs: [],
            },
            {
              label: 3,
              value: 0,
              videoIDs: [],
            },
            {
              label: 4,
              value: 0,
              videoIDs: [],
            },
            {
              label: 5,
              value: 0,
              videoIDs: [],
            },
            {
              label: 6,
              value: 0,
              videoIDs: [],
            },
            {
              label: 7,
              value: 0,
              videoIDs: [],
            },
            {
              label: 8,
              value: 0,
              videoIDs: [],
            },
            {
              label: 9,
              value: 0,
              videoIDs: [],
            },
            {
              label: 10,
              value: 0,
              videoIDs: [],
            },
            {
              label: 11,
              value: 0,
              videoIDs: [],
            },
            {
              label: 12,
              value: 0,
              videoIDs: [],
            },
            {
              label: 13,
              value: 0,
              videoIDs: [],
            },
            {
              label: 14,
              value: 0,
              videoIDs: [],
            },
            {
              label: 15,
              value: 0,
              videoIDs: [],
            },
            {
              label: 16,
              value: 0,
              videoIDs: [],
            },
            {
              label: 17,
              value: 0,
              videoIDs: [],
            },
            {
              label: 18,
              value: 0,
              videoIDs: [],
            },
            {
              label: 19,
              value: 0,
              videoIDs: [],
            },
            {
              label: 20,
              value: 0,
              videoIDs: [],
            },
            {
              label: 21,
              value: 0,
              videoIDs: [],
            },
            {
              label: 22,
              value: 0,
              videoIDs: [],
            },
            {
              label: 23,
              value: 0,
              videoIDs: [],
            },
          ];

          trackedHours.set(hour, 1);
          // add a day to resultsByHour array
          resultByHour.push(freqDayTemplate);
          // add a date for the drop down
          resultsDatesForHours.push({
            label: date,
            value: trackedDatesForHours.size - 1,
          });
          console.log(
            'ooooooooo new tracked date',
            date,
            trackedDatesForHours,
            hour,
            trackedHours,
          );
        } else {
          trackedDatesForHours.set(date, trackedDatesForHours.get(date) + 1);
          if (!trackedHours.has(hour)) {
            trackedHours.set(hour, 1);
            console.log('ooooooooo new tracked hour', hour, trackedHours);
          } else {
            trackedHours.set(hour, trackedHours.get(hour) + 1);
            console.log('ooooooooo already tracked hour', hour, trackedHours);
          }
        }

        if (!trackedDatesForWeeks.has(date)) {
          trackedDatesForWeeks.set(date, 1);
          // refresh tracked hours for a new day
          [...trackedWeeks.keys()].forEach(key => {
            trackedWeeks.set(key, 0);
            console.log('reset key ', key);
          });
          // need to reset template data
          freqWeekTemplate = [
            {
              label: 0,
              value: 0,
              videoIDs: [],
            },
            {
              label: 1,
              value: 0,
              videoIDs: [],
            },
            {
              label: 2,
              value: 0,
              videoIDs: [],
            },
            {
              label: 3,
              value: 0,
              videoIDs: [],
            },
            {
              label: 4,
              value: 0,
              videoIDs: [],
            },
            {
              label: 5,
              value: 0,
              videoIDs: [],
            },
            {
              label: 6,
              value: 0,
              videoIDs: [],
            },
          ];

          trackedWeeks.set(hour, 1);
          // add a day to resultsByHour array
          resultByWeek.push(freqWeekTemplate);
          // add a date for the drop down
          resultsDatesForWeeks.push({
            label: week,
            value: trackedDatesForWeeks.size - 1,
          });
          console.log(
            'ooooooooo new tracked week',
            week,
            trackedDatesForWeeks,
            hour,
            trackedWeeks,
          );
        } else {
          trackedDatesForWeeks.set(week, trackedDatesForWeeks.get(week) + 1);
          if (!trackedWeeks.has(week)) {
            trackedWeeks.set(week, 1);
            console.log('ooooooooo new tracked week', week, trackedWeeks);
          } else {
            trackedWeeks.set(week, trackedWeeks.get(week) + 1);
            console.log('ooooooooo already tracked week', week, trackedWeeks);
          }
        }

        if (!trackedDatesForMonths.has(yearDate)) {
          trackedDatesForMonths.set(yearDate, 1);
          // refresh tracked hours for a new day
          [...trackedMonths.keys()].forEach(key => {
            trackedMonths.set(key, 0);
            console.log('reset key ', key);
          });
          // need to reset template data
          freqMonthTemplate = [
            {
              label: 0,
              value: 0,
              videoIDs: [],
            },
            {
              label: 1,
              value: 0,
              videoIDs: [],
            },
            {
              label: 2,
              value: 0,
              videoIDs: [],
            },
            {
              label: 3,
              value: 0,
              videoIDs: [],
            },
            {
              label: 4,
              value: 0,
              videoIDs: [],
            },
            {
              label: 5,
              value: 0,
              videoIDs: [],
            },
            {
              label: 6,
              value: 0,
              videoIDs: [],
            },
            {
              label: 7,
              value: 0,
              videoIDs: [],
            },
            {
              label: 8,
              value: 0,
              videoIDs: [],
            },
            {
              label: 9,
              value: 0,
              videoIDs: [],
            },
            {
              label: 10,
              value: 0,
              videoIDs: [],
            },
            {
              label: 11,
              value: 0,
              videoIDs: [],
            },
          ];

          trackedMonths.set(month, 1);
          // add a day to resultsByHour array
          resultByMonth.push(freqMonthTemplate);
          // add a date for the drop down
          resultsDatesForMonths.push({
            label: yearDate,
            value: trackedDatesForMonths.size - 1,
          });
          console.log(
            'ooooooooo new tracked month',
            yearDate,
            trackedDatesForMonths,
            month,
            trackedMonths,
          );
        } else {
          trackedDatesForMonths.set(
            yearDate,
            trackedDatesForMonths.get(month) + 1,
          );
          if (!trackedMonths.has(month)) {
            trackedMonths.set(month, 1);
            console.log('ooooooooo new tracked month', month, trackedMonths);
          } else {
            trackedMonths.set(month, trackedMonths.get(month) + 1);
            console.log(
              'ooooooooo already tracked month',
              month,
              trackedMonths,
            );
          }
        }

        // access most recent day (because maps should be orderd by date already)
        // increment the count for the current video's hour
        // resultByMonth[trackedDatesForMonths.size - 1][month].videoIDs.push(
        //   freqMaps[i].videoID,
        // );
        // resultByWeek[trackedDatesForWeeks.size - 1][week].videoIDs.push(
        //   freqMaps[i].videoID,
        // );
        resultByMonth[trackedDatesForMonths.size - 1][month].value +=
          maps[i].get(word);
        resultByMonth[trackedDatesForMonths.size - 1][month].videoIDs.push(
          freqMaps[i].videoID,
        );
        // resultByWeek[trackedDatesForWeeks.size - 1][week].value += maps[i].get(
        //   word,
        // );
        // resultByWeek[trackedDatesForWeeks.size - 1][week].videoIDs.push(
        //   freqMaps[i].videoID,
        // );
        resultByHour[trackedDatesForHours.size - 1][hour].value +=
          maps[i].get(word);
        resultByHour[trackedDatesForHours.size - 1][hour].videoIDs.push(
          freqMaps[i].videoID,
        );
        console.log(
          'ooooooooo adding word count by week ---- count: ',
          week,
          maps[i].get(word),
        );
      }
    }
    console.log(resultsDatesForHours);
    console.log(resultByHour);
    console.log(resultsDatesForWeeks);
    console.log(resultByWeek);
    console.log(resultsDatesForMonths);
    console.log(resultByMonth);

    //setFreqMaps([]);
    return {
      datesForHours: resultsDatesForHours,
      byHour: resultByHour,
      datesForWeeks: resultsDatesForWeeks,
      byWeek: resultByWeek,
      datesForMonths: resultsDatesForMonths,
      byMonth: resultByMonth,
      // datesForYears: resultsDatesForYears,
      // byYear: resultByYear,
    };
  };
  return setLineGraphData;
}

function accessFreqMaps(freqMaps: any) {
  let temp = freqMaps;
  let result = [];
  for (let i = 0; i < temp.length; i++) {
    result.push(temp[i].map);
  }
  return result;
}

function getWeekNumber(date: Date) {
  const firstJan = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor(
    (date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((days + firstJan.getDay() + 1) / 7);
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

    let resultsDatesForHours = [];
    let resultByHour = [];

    let resultsDatesForWeeks = [];
    let resultByWeek = [];

    let resultsDatesForMonths = [];
    let resultByMonth = [];

    for (let i = 0; i < freqMaps.length; i++) {
      let saveDate = new Date(freqMaps[i].datetime);
      let dateString = saveDate.toDateString(); // "Mon Apr 29 2024"
      let weekNumber = getWeekNumber(saveDate);
      let monthNumber = saveDate.getMonth(); // 0 - 11
      let yearNumber = saveDate.getFullYear();
      let hour = saveDate.getHours();
      let weekLabel = `Week ${weekNumber} (${yearNumber})`;

      if (freqMaps[i].map.has(word)) {
        // Process DAILY Data
        if (!trackedDatesForHours.has(dateString)) {
          trackedDatesForHours.set(dateString, 1);
          freqDayTemplate = freqDayTemplate.map(item => ({ ...item, value: 0, videoIDs: [] }));
          resultByHour.push(freqDayTemplate);
          resultsDatesForHours.push({
            label: dateString,
            value: trackedDatesForHours.size - 1,
          });
        }
        resultByHour[trackedDatesForHours.size - 1][hour].value += freqMaps[i].map.get(word);
        resultByHour[trackedDatesForHours.size - 1][hour].videoIDs.push(freqMaps[i].videoID);

        // Process WEEKLY Data
        if (!trackedDatesForWeeks.has(weekLabel)) {
          trackedDatesForWeeks.set(weekLabel, 1);
          freqWeekTemplate = freqWeekTemplate.map(item => ({ ...item, value: 0, videoIDs: [] }));
          resultByWeek.push(freqWeekTemplate);
          resultsDatesForWeeks.push({
            label: weekLabel,
            value: trackedDatesForWeeks.size - 1,
          });
        }
        let weekIndex = trackedDatesForWeeks.size - 1;
        let dayIndex = saveDate.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        resultByWeek[weekIndex][dayIndex].value += freqMaps[i].map.get(word);
        resultByWeek[weekIndex][dayIndex].videoIDs.push(freqMaps[i].videoID);

        // Process MONTHLY Data
        let monthLabel = `${saveDate.toLocaleString("default", { month: "long" })} ${yearNumber}`;
        if (!trackedDatesForMonths.has(monthLabel)) {
          trackedDatesForMonths.set(monthLabel, 1);
          freqMonthTemplate = freqMonthTemplate.map(item => ({ ...item, value: 0, videoIDs: [] }));
          resultByMonth.push(freqMonthTemplate);
          resultsDatesForMonths.push({
            label: monthLabel,
            value: trackedDatesForMonths.size - 1,
          });
        }
        let monthIndex = trackedDatesForMonths.size - 1;
        resultByMonth[monthIndex][monthNumber].value += freqMaps[i].map.get(word);
        resultByMonth[monthIndex][monthNumber].videoIDs.push(freqMaps[i].videoID);
      }
    }

    return {
      datesForHours: resultsDatesForHours,
      byHour: resultByHour,
      datesForWeeks: resultsDatesForWeeks,
      byWeek: resultByWeek,
      datesForMonths: resultsDatesForMonths,
      byMonth: resultByMonth,
    };
  };

  return setLineGraphData;
}


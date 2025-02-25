function accessFreqMaps(freqMaps: any) {
  let temp = freqMaps;
  let result = [];
  for (let i = 0; i < temp.length; i++) {
    result.push(temp[i].map);
  }
  return result;
}

function getWeekStartAndEnd(date: Date) {
  const dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek); // Move to Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Saturday
  return {
    start: startOfWeek.toDateString(),
    end: endOfWeek.toDateString(),
  };
}

// Base templates for daily and weekly data
let freqDayTemplate = Array.from({ length: 24 }, (_, i) => ({
  label: i,
  value: 0,
  videoIDs: [],
}));

let freqWeekTemplate = Array.from({ length: 7 }, (_, i) => ({
  label: i,
  value: 0,
  videoIDs: [],
}));

export function useSetLineGraphData() {
  const setLineGraphData = (
    freqMaps: any,
    word: string,
    earliestVideoDateTime: string,
    latestVideoDateTime: string,
  ) => {
    let maps = accessFreqMaps(freqMaps);

    let trackedDatesForHours = new Map();
    let trackedDatesForWeeks = new Map();

    let resultsDatesForHours = [];
    let resultByHour = [];

    let resultsDatesForWeeks = [];
    let resultByWeek = [];

    let resultsDatesForRange = [];
    let resultByRange = [];

    // Parse the earliest and latest video dates
    const earliestDate = new Date(earliestVideoDateTime);
    const latestDate = new Date(latestVideoDateTime);

    // Initialize range data
    let rangeData = {
      label: `${earliestDate.toDateString()} - ${latestDate.toDateString()}`,
      value: 0,
      videoIDs: [],
    };

    for (let i = 0; i < freqMaps.length; i++) {
      let saveDate = new Date(freqMaps[i].datetime);
      let dateString = saveDate.toDateString(); // "Mon Apr 29 2024"
      let { start: weekStart, end: weekEnd } = getWeekStartAndEnd(saveDate);
      let hour = saveDate.getHours();
      let weekLabel = `${weekStart} - ${weekEnd}`;

      if (freqMaps[i].map.has(word)) {
        // Process DAILY Data
        if (!trackedDatesForHours.has(dateString)) {
          trackedDatesForHours.set(dateString, resultsDatesForHours.length);
          resultByHour.push(
            Array.from({ length: 24 }, () => ({
              label: 0,
              value: 0,
              videoIDs: [],
            })),
          );
          resultsDatesForHours.push({
            label: dateString,
            value: resultsDatesForHours.length,
          });
        }
        const hourIndex = trackedDatesForHours.get(dateString);
        resultByHour[hourIndex][hour].value += freqMaps[i].map.get(word);
        resultByHour[hourIndex][hour].videoIDs.push(freqMaps[i].videoID);

        // Process WEEKLY Data
        if (!trackedDatesForWeeks.has(weekLabel)) {
          trackedDatesForWeeks.set(weekLabel, resultsDatesForWeeks.length);
          resultByWeek.push(
            Array.from({ length: 7 }, () => ({
              label: 0,
              value: 0,
              videoIDs: [],
            })),
          );
          resultsDatesForWeeks.push({
            label: weekLabel,
            value: resultsDatesForWeeks.length,
          });
        }
        const weekIndex = trackedDatesForWeeks.get(weekLabel);
        const dayIndex = saveDate.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
        resultByWeek[weekIndex][dayIndex].value += freqMaps[i].map.get(word);
        resultByWeek[weekIndex][dayIndex].videoIDs.push(freqMaps[i].videoID);

        // Process RANGE Data
        if (saveDate >= earliestDate && saveDate <= latestDate) {
          rangeData.value += freqMaps[i].map.get(word);
          rangeData.videoIDs.push(freqMaps[i].videoID);
        }
      }
    }

    // Populate resultsDatesForRange and resultByRange
    resultsDatesForRange = [rangeData];
    resultByRange = [rangeData];

    // Sort resultsDatesForHours by chronological order and update values
    resultsDatesForHours = resultsDatesForHours.map((item, index) => ({ ...item, value: index }));

    resultsDatesForWeeks = resultsDatesForWeeks.map((item, index) => ({ ...item, value: index }));

    return {
      datesForHours: resultsDatesForHours,
      byHour: resultByHour,
      datesForWeeks: resultsDatesForWeeks,
      byWeek: resultByWeek,
      datesForRange: resultsDatesForRange,
      byRange: resultByRange,
    };
  };

  return setLineGraphData;
}


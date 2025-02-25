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
let freqDayTemplate = Array.from({length: 24}, (_, i) => ({
  label: i,
  value: 0,
  videoIDs: [],
}));

let freqWeekTemplate = Array.from({length: 7}, (_, i) => ({
  label: i,
  value: 0,
  videoIDs: [],
}));

export function useSetLineGraphData() {
  const setLineGraphData = (freqMaps: any, word: string) => {
    let maps = accessFreqMaps(freqMaps);

    let trackedDatesForHours = new Map();
    let trackedDatesForWeeks = new Map();

    let resultsDatesForHours = [];
    let resultByHour = [];

    let resultsDatesForWeeks = [];
    let resultByWeek = [];

    let resultsDatesForRange = [];
    let resultByRange = [];

    // Dynamically determine the earliest and latest dates from freqMaps
    const allDates = freqMaps.map(item => new Date(item.datetime));
    const earliestDate = new Date(
      Math.min(...allDates.map(date => date.getTime())),
    );
    const latestDate = new Date(
      Math.max(...allDates.map(date => date.getTime())),
    );

    // Format the range label to include month and date
    const formatDate = (date: Date) =>
      `${date.toLocaleString('default', {month: 'long'})} ${date.getDate()}`;

    // Initialize range data
    let rangeData = {
      label: `${formatDate(earliestDate)} - ${formatDate(latestDate)}`, // e.g., "April 1 - April 30"
      value: 0,
      videoIDs: [],
    };

    for (let i = 0; i < freqMaps.length; i++) {
      let saveDate = new Date(freqMaps[i].datetime);
      let dateString = saveDate.toDateString(); // "Mon Apr 29 2024"
      let {start: weekStart, end: weekEnd} = getWeekStartAndEnd(saveDate);
      let hour = saveDate.getHours();
      let weekLabel = `${weekStart} - ${weekEnd}`;

      if (freqMaps[i].map.has(word)) {
        // Process DAILY Data
        if (!trackedDatesForHours.has(dateString)) {
          trackedDatesForHours.set(dateString, resultsDatesForHours.length);
          resultByHour.push(
            Array.from({length: 24}, () => ({
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
            Array.from({length: 7}, () => ({
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
          // Extract month and day
          const monthDayKey = `${
            saveDate.getMonth() + 1
          }-${saveDate.getDate()}`; // e.g., "2-25" for February 25

          // Check if the month-day key already exists in resultByRange
          let rangeEntry = resultByRange.find(
            entry => entry.label === monthDayKey,
          );

          if (!rangeEntry) {
            // If the entry doesn't exist, create a new one
            rangeEntry = {
              label: monthDayKey, // e.g., "2-25"
              value: 0,
              videoIDs: [],
            };
            resultByRange.push(rangeEntry);
          }

          // Update the range entry
          rangeEntry.value += freqMaps[i].map.get(word);
          rangeEntry.videoIDs.push(freqMaps[i].videoID);
        }
      }
    }

    // Reverse and update resultsDatesForHours
    resultsDatesForHours = (resultsDatesForHours || [])
      .reverse()
      .map((item, index) => ({
        ...item,
        value: index, // Update the value to reflect the new order
        videoIDs: Array.from(new Set(item.videoIDs || [])).reverse(), // Deduplicate and reverse the videoIDs array
      }));

    // Reverse and update resultsDatesForWeeks
    resultsDatesForWeeks = (resultsDatesForWeeks || [])
      .reverse()
      .map((item, index) => ({
        ...item,
        value: index, // Update the value to reflect the new order
        videoIDs: Array.from(new Set(item.videoIDs || [])).reverse(), // Deduplicate and reverse the videoIDs array
      }));

    // Reverse and update resultsDatesForRange
    resultsDatesForRange = (resultByRange || [])
      .reverse()
      .map((entry, index) => ({
        label: entry.label, // Month and day (e.g., "2-25")
        value: entry.value, // Use the aggregated value
        videoIDs: Array.from(new Set(entry.videoIDs || [])).reverse(), // Deduplicate and reverse the videoIDs array
      }));

    return {
      datesForHours: resultsDatesForHours,
      byHour: resultByHour.reverse(), 
      datesForWeeks: resultsDatesForWeeks,
      byWeek: resultByWeek.reverse(), 
      datesForRange: resultsDatesForRange,
      byRange: resultByRange.reverse(), 
    };
  };

  return setLineGraphData;
}

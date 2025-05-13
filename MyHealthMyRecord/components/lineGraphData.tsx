function accessFreqMaps(freqMaps: any[]) {
  return freqMaps
    .filter(item => item && typeof item.map === 'object' && item.map !== null)
    .map(item => ({
      map: new Map(Object.entries(item.map)), // convert plain object to Map
      datetime: item.datetime,
      videoID: item.videoID,
    }));
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
    let maps = accessFreqMaps(freqMaps); // convert maps to proper Map objects

    console.log('Parsed frequency maps (as Map objects):', maps);

    let trackedDatesForHours = new Map();
    let trackedDatesForWeeks = new Map();

    let resultsDatesForHours = [];
    let resultByHour = [];

    let resultsDatesForWeeks = [];
    let resultByWeek = [];

    let resultsDatesForRange = [];
    let resultByRange = [];

    // Dynamically determine the earliest and latest dates from freqMaps
    const allDates = maps.map(item => new Date(item.datetime));
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

    // Pre-fill all range dates with zero values using a Map for fast updates
    const rangeMap = new Map<
      string,
      {label: string; value: number; videoIDs: string[]}
    >();
    const rangeDateCursor = new Date(earliestDate);

    while (rangeDateCursor <= latestDate) {
      const monthDayKey = `${
        rangeDateCursor.getMonth() + 1
      }-${rangeDateCursor.getDate()}`;
      rangeMap.set(monthDayKey, {
        label: monthDayKey,
        value: 0,
        videoIDs: [],
      });
      rangeDateCursor.setDate(rangeDateCursor.getDate() + 1);
    }

    for (let i = 0; i < maps.length; i++) {
      let saveDate = new Date(maps[i].datetime);
      let dateString = saveDate.toDateString(); // "Mon Apr 29 2024"
      let {start: weekStart, end: weekEnd} = getWeekStartAndEnd(saveDate);
      let hour = saveDate.getHours();
      let weekLabel = `${weekStart} - ${weekEnd}`;

      if (maps[i].map.has(word)) {
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
        resultByHour[hourIndex][hour].value += maps[i].map.get(word);
        resultByHour[hourIndex][hour].videoIDs.push(maps[i].videoID);

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
        resultByWeek[weekIndex][dayIndex].value += maps[i].map.get(word);
        resultByWeek[weekIndex][dayIndex].videoIDs.push(maps[i].videoID);

        // Process RANGE Data
        if (saveDate >= earliestDate && saveDate <= latestDate) {
          // Extract month and day
          const monthDayKey = `${
            saveDate.getMonth() + 1
          }-${saveDate.getDate()}`; // e.g., "2-25" for February 25

          const rangeEntry = rangeMap.get(monthDayKey);

          if (rangeEntry) {
            rangeEntry.value += maps[i].map.get(word);
            rangeEntry.videoIDs.push(maps[i].videoID);
          }

          resultByRange = Array.from(rangeMap.values());
        }
      }
    }

    // Reverse and update resultsDatesForHours
    // Sort daily by actual date
    resultsDatesForHours = resultsDatesForHours
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime())
      .map((item, index) => ({
        ...item,
        value: index,
        videoIDs: Array.from(new Set(item.videoIDs || [])),
      }));

    // Sort resultByHour to match resultsDatesForHours
    resultByHour = resultsDatesForHours.map(
      date => resultByHour[trackedDatesForHours.get(date.label)],
    );

    // Sort weekly by week start date
    resultsDatesForWeeks = resultsDatesForWeeks
      .sort((a, b) => {
        const [startA] = a.label.split(' - ');
        const [startB] = b.label.split(' - ');
        return new Date(startA).getTime() - new Date(startB).getTime();
      })
      .map((item, index) => ({
        ...item,
        value: index,
        videoIDs: Array.from(new Set(item.videoIDs || [])),
      }));

    // Sort resultByWeek to match resultsDatesForWeeks
    resultByWeek = resultsDatesForWeeks.map(
      date => resultByWeek[trackedDatesForWeeks.get(date.label)],
    );


    // Sort range by MM-DD interpreted as real date
    resultsDatesForRange = (resultByRange || [])
      .sort((a, b) => {
        const [monthA, dayA] = a.label.split('-').map(Number);
        const [monthB, dayB] = b.label.split('-').map(Number);
        return (
          new Date(2000, monthA - 1, dayA) - new Date(2000, monthB - 1, dayB)
        );
      })
      .map((entry, index) => ({
        label: entry.label,
        value: index,
        videoIDs: Array.from(new Set(entry.videoIDs || [])),
      }));

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

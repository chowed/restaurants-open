const moment = require('moment');
const { INDEX_OF_DAY } = require('./constants');

/**
 * Calculates time elapsed since the start of the day in minutes
 *
 * @param {string} hour In 24-hour time
 * @param {string} minutes
 * @returns {number}
 */
function calculateEpochDayMins(hour, minutes) {
  return hour * 60 + parseInt(minutes);
}

/**
 * Gets time elapsed since the start of the day in minutes
 *
 * @param {string} timeString In 12-hour time e.g. `9 pm`
 * @returns {number} Time since the start of the day in minutes
 */
function getEpochDayMins(timeString) {
  const timeString24Hour = moment(timeString, 'h:m a').format('HH:mm'); // convert to 24-hour time
  const timeString24HourArray = timeString24Hour.split(':');
  return calculateEpochDayMins(timeString24HourArray[0], timeString24HourArray[1]);
}

/**
 * Days and times into a format that is used in determining if the user's input falls within the
 * restaurant's opening period and duration
 *
 * @param {string} dateString In 12-hour time e.g. `9 pm`
 * @returns {Object} dateObj Returns object with processed day and time data
 * @returns {number} dateObj.startTime Day epoch from start time in minutes
 * @returns {number} dateObj.endTime Day epoch from end time in minutes
 * @returns {number} dateObj.startDayIndex Index of start day in the week
 * @returns {number} dateObj.endDayIndex Index of end day in the week
 */
const DateFactory = function (dateString) {
  const trimmedDate = dateString.trim();
  const dayString = trimmedDate.substring(0, trimmedDate.indexOf(' ')); // e.g. `Sat-Tue`
  const timeString = trimmedDate.substring(trimmedDate.indexOf(' ') + 1); // e.g. `11:30 am - 12:30 am`
  const daysArray = dayString.split('-');
  const timeArray = timeString.split('-');

  const startDayIndex = INDEX_OF_DAY[daysArray[0]];
  const startTime = getEpochDayMins(timeArray[0]);
  const endTime = getEpochDayMins(timeArray[1]);

  let endDayIndex;
  if (daysArray.length > 1) { // deal with multiple days
    endDayIndex = INDEX_OF_DAY[daysArray[1]];
    if (startDayIndex > endDayIndex) { // end day is past Sunday
      endDayIndex += 7;
    }
  } else { // 1 day
    endDayIndex = startDayIndex;
  }
  this.startTime = startTime;
  this.endTime = endTime;
  this.startDayIndex = startDayIndex;
  this.endDayIndex = endDayIndex;
};

/**
 * Check if the user's time falls within the opening hours. Returns true if equal to or greater
 * than start Time and is less than the end time. Deals with times in minutes
 *
 * @param {number} startTime Epoch day for start time in minutes
 * @param {number} userTime Epoch day for user input in minutes
 * @param {number} endTime Epoch day for end time in minutes
 * @returns {boolean}
 */
function checkTime(startTime, userTime, endTime) {
  return startTime <= userTime && userTime < endTime;
}

/**
 * Check if the user's day falls within the opening days. Accommodates for single day,
 * multi-days, and multi-days with end day beyond Sunday
 *
 * @param {number} startDayIndex Epoch week for start day in days
 * @param {number} userDayIndex Epoch week for user input in days
 * @param {number} endDayIndex Epoch week for end day in days
 * @returns {boolean}
 */
function checkDay(startDayIndex, userDayIndex, endDayIndex) {
  if (startDayIndex === endDayIndex) { // duration only contains 1 day
    return startDayIndex === userDayIndex;
  } if (startDayIndex > endDayIndex) { // last day of multi-day goes past Sun e.g. Tue
    return startDayIndex <= userDayIndex || userDayIndex <= endDayIndex;
  }
  return startDayIndex <= userDayIndex && userDayIndex <= endDayIndex; // regular multi-day case
}

/**
 * Check if the user's day falls within the opening days. Accommodates for single day,
 * multi-days, and multi-days with end day beyond Sunday. This check could be improved
 * by separating checkDay and checkTime, detailed in the readme.
 *
 * @param {number} startDayIndex Epoch week for start day in days
 * @param {number} userDayIndex Epoch week for user input in days
 * @param {number} endDayIndex Epoch week for end day in days
 * @returns {boolean}
 */
function checkDates(userDayIndex, userTime, startDayIndex, endDayIndex, startTime, endTime) {
  if (checkDay(startDayIndex, userDayIndex, endDayIndex)) {
    return checkTime(startTime, userTime, endTime);
  }
  return false;
}

/**
 * Determines if the user input time falls within the restaurant's segment's opening hours
 *
 * @param {luxon.DateTime} timeObj
 * @param {string} dateSegment
 * @returns {boolean}
 */
function checkOpeningDaysAndHours(timeObj, dateSegment) {
  const userDayIndex = INDEX_OF_DAY[timeObj.weekdayShort]; // epoch week in days
  const userTimeEpochDay = calculateEpochDayMins(timeObj.hour, timeObj.minute);

  const d = new DateFactory(dateSegment);
  // this efficiency could be improved
  if (d.startTime > d.endTime) { // time goes into next day e.g. `1 am`
    // 1st checkDays: accepted time = startTime to the end of day
    // 2nd checkDays: accepted time = start of day to endTime, and checks the next days instead
    // modulus ensures day index doesn't go out of range (7). max mins in a day is 60 * 24 = 1440
    return checkDates(userDayIndex, userTimeEpochDay, d.startDayIndex, d.endDayIndex % 7, d.startTime, 1440)
    || checkDates(userDayIndex, userTimeEpochDay, (d.startDayIndex + 1) % 7, (d.endDayIndex + 1) % 7, 0, d.endTime);
  }
  return checkDates(userDayIndex, userTimeEpochDay, d.startDayIndex, d.endDayIndex, d.startTime, d.endTime);
}

module.exports = {
  checkOpeningDaysAndHours,
};

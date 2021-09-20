const { checkOpeningDaysAndHours } = require('./helpers');

/**
 * This class takes the name of a JSON file containing details on opening hours
 * for a number of restaurants. It parses the contents of this file and then
 * provides a method for querying which restaurants are open at a specified date
 * and time. The input JSON file can be assumed to contain correctly formatted
 * data.
 *
 * All dates and times can be assumed to be in the same time zone.
 */
class Restaurants {
  constructor(jsonFilename) {
    const jsonData = require(jsonFilename);
    this.data = jsonData.restaurants;
  }

  /**
   * Finds the restaurants open at the specified time.
   *
   * @param {luxon.DateTime} time
   * @returns {Array<string>} The names of the restaurants open at the specified
   * time. The order of the elements in this array is alphabetical.
   */
  getRestaurantsOpenAt(time) {
    try {
      if (time.invalid != null) {
        throw new Error(time.invalid.explanation);
      } if (time.day - 10 > 6) {
        throw new Error(`Day input needs to be between 0 - 6, you've entered: ${time.day - 10}`);
      }
      const openRestaurants = [];
      this.data.forEach((restaurant) => {
        const openDaysAndTimesSegments = restaurant.opening_hours.split(';');
        // dateSegment looks like `Sat-Tue 11:30 am - 12:30 am`
        const restaurantOpen = typeof openDaysAndTimesSegments.find((dateSegment) => checkOpeningDaysAndHours(time, dateSegment)) === 'string';
        if (restaurantOpen) {
          openRestaurants.push(restaurant.name);
        }
      });
      return openRestaurants.sort();
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
}

module.exports = Restaurants;

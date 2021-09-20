const luxon = require('luxon');
const Restaurants = require('./restaurants');

const restaurantDataFile = '../restaurant_data.json';
const restaurants = new Restaurants(restaurantDataFile);
const dayArray = luxon.Info.weekdays('long');

// feel free to change these values
const inputDay = 2; // 0 - 6
const inputHour = 0; // 0 - 23
const inputMinute = 15; // 0 - 59

/**
 * Provides a means of running the app to see open restaurants at a user's input time
 *
 */
function initialise() {
  const inputDateObj = luxon.DateTime.local(2021, 5, 10 + inputDay, inputHour, inputMinute);
  try {
    const restaurantsOpen = restaurants.getRestaurantsOpenAt(inputDateObj);
    const inputDateMessage = `${inputDateObj.hour}:${inputDateObj.minute} on ${dayArray[inputDay]}s`;
    if (restaurantsOpen.length === 0) {
      console.log(`There are no restaurants open at ${inputDateMessage}`);
    } else {
      console.log(`The restaurants open at ${inputDateMessage} are: `);
      restaurantsOpen.forEach((restaurant) => console.log(`  - ${restaurant}`));
    }
  } catch (error) {
    console.log(`Error trying to get restaurants at ${inputHour}:${inputMinute} on ${dayArray[inputDay]}s`);
  }
}

initialise();

const luxon = require('luxon');
const Restaurants = require('./restaurants');

const restaurantDataFile = '../restaurant_data.json';
const restaurants = new Restaurants(restaurantDataFile);
const dayArray = luxon.Info.weekdays('long');

const inputDay = 2;
const inputHour = 0;
const inputMinute = 15;

function initialise() {
  const inputDateObj = luxon.DateTime.local(2021, 6, inputDay, inputHour, inputMinute);
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

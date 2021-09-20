# Open Restaurants

## Instructions

- Requires installation of Node.js (preferably version >=12)
- `npm install`
- `npm run start`

To run tests
- `npm run test`

## Implementation

### How it works

The entrypoint of the app is at `/app/index.js`, where the class `Restaurant` is created (lives in `app/restaurant.js`). The constructor method reads the `restaurant_data.json` file and provides access to this data. The function `getRestaurantsOpenAt` takes in the user's input day and time in the form of a luxon DateTime object as its parameter.

The restaurants in `restaurant_data.json` are iterated through and each segment of the restaurant's `opening_hours` (each one is separated by a `;`) get checked by calling the helper function `checkOpeningDaysAndHours`, which passes in the DateTime object and passes in a segment.

Both user (DateTime object) and opening times (from segment) are converted into minutes elapsed that day, and returns true if the day matches and the user's time is `open time <= user time < close time`, although this is slightly different for times where the close time is past midnight.

Now knowing that the restaurant is open, the restuarant's name is appended into the array. When all restaurants have been iterated over, the resulting array is sorted alphabetically before returning.

If the user inputs an invalid value for the time, there is an error that gets logged telling the user what invalid input they've given.

### Design considerations

Time for DateTime object and segment from `opening_hours` need to be converted into a common time unit so they can be compared. I decided to convert them into minutes elapsed since the start of the day (Epoch day) since I couldn't find a way to convert them straight into a common time unit using the luxon package. Minutes are the smallest unit of time taken in by `luxon.DateTime.local()`, and also the smallest time unit provided in the `restaurant_data.json` so it works out. For the days, I worked in day of the week (Epoch week) which allowed me to iterate through days easily.

I accommodated for times going past midnight (start time > end time) by doing 2 checks on the segment in `opening_hours`: only if the day is correct, then check the duration from start time to the end of the day (1440 is the number of minutes in a day). If the the day isn't correct, then it checks the start of the day (0) until the end time for days `startDay + 1` to `endDay + 1` 

I have followed the constructor pattern for consistency when creating the objects.

`.find()` was used when checking the segments under `opening_hours` because there is no need to check further segments if we know the restaurant is open at that time.

I chose to read the `restaurant_data.json` using `require()` instead of `fs.readFile()` because using `require()` caches the file and is suitable for this context seeing that its contents are static.

Eslint used to ensure consistent conventions (using AirBnB standard), and 2 spaces indents allows more code to be visibly seen.

I kept the structure flat since this is not a complicated project and makes it easier to navigate to files. Having the helper functions in one file would also make it easier to see what's going on when following along the code, although the file was starting to get large.

One solution I thought about was converting the `opening_hours` string for each restaurant into a lookup object. It would be an object with the open days as the keys, and the value would be an array of objects, with each object key:value being startTime:endTime. It would look something like `{ "Mon": [{300:360}], ... }` but this would have to be done in the constructor with the given skeleton. It is good practice to avoid logic in the constructor.

Test cases could have been added for the helper functions but the primary focus of this assignment is testing the querying function `getRestaurantsOpenAt` so that's what I focused on.

## Improvements

Improvements could be made to the checking the opening hours for a test case where its end time is beyond Midnight e.g. `Tue-Wed 11 pm - 2 am`. Only 1 call to `checkDay` is required to determine if the user's day is correct (or potentially correct if time past midnight). The function `checkDates` would need to be enhanced so that we can avoid a 2nd call to `checkDay`. This may result in a few extra checks so hard to say if this is more optimal.

Having a test cases that checks the throw message for invalid user input - was having trouble with chai checking the throw error.

Could use the `pre-commit` npm package, which only accepts the commit once tests have run and been successful. This would guarantee that tests are run before being committed rather than having to rely on memory.

Having varying logging levels using Winston so error logs that might get triggered by test cases don't show up

## Tests

These are the different scenarios I could come up with:
- restaurants could have multiple opening segments
- single day in a segment
- single day in a segment where end time is beyond Sunday
- multiple days in a segment
- multiple days in a segment where end time is beyond Sunday
- multiple days where the end date is beyond Sunday
- multiple days where end date is beyond Sunday, and end time is beyond midnight
- restaurants re-opening later in the day
- open time means start time and onwards e.g. user input of `8:30am` and open time at `8:30am` means the restaurant is open at the user's time
- closed time means end time and onwards e.g. user input of `9pm` and close time at `9pm` means the restaurant is <u>not</u> open at the user's time
- returns with meaningful error message when user inputs a number outside of its time range

## Feedback

Interested in hearing specific feedback on:
- the solution I have used and what a better solution would be. I noticed a // TODO in the `Restaurant` constructor but I haven't done anything there, so I've probably done it a different way than expected
- code readability
- formatting
- variable, file, and function names
- function documentation and code comments
Other comments are welcome and appreciated

## Glossary
- epoch: time elapsed since the start of specified period
- epoch day: minutes elapsed since 00:00 that day
- epoch week: days elapsed since Monday
- segment: one of the `opening_hour` portions (each separated by `;`)
- period: referring to day(s) the restaurant is open on
- duration: refering to times of the day the restaurant is open

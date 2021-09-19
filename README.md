# Open Restaurants

## Instructions

- Requires installation of Node.js (version 12)
- `npm install`
- `npm run test`

## Implementation

### How it works

The class `Restaurant` is instantiated where the constructor method reads the `restaurant_data.json` file and provides access to this data. The function `getRestaurantsOpenAt` takes in the user's input day and time in the form of a luxon DateTime object as its parameter.

The restaurants in `restaurant_data.json` are iterated through and a helper function `checkOpeningDaysAndHours` is called, passing in the DateTime object and passes in 1 of the segments of the restaurant's `opening_hours` which are separated by a `;` (iterated through). 

Both user and opening times are converted into minutes elapsed that day, and returns true if the day matches and the user's time is `open time <= user time < close time`, although this is slightly different for times where the close time is past midnight.

Now knowing that the restaurant is open, the restuarant's name is appended into the array. When all restaurants have been iterated over, the resulting array is sorted alphabetically before returning.

If the user inputs an invalid value for the time, there is an error that gets logged telling the user what invalid input they've given.

### Design considerations

Time for DateTime object and segment from `opening_hours` need to be converted into a common time unit so they can be compared. I decided to convert them into minutes elapsed since the start of the day (Epoch day) since I couldn't find a of converting them straight into a common time unit using the luxon package. Minutes are the smallest unit of time taken in by `luxon.DateTime.local()`, and also provided in the `restaurant_data.json` so it works out. For the days, I worked in day of the week (Epoch week) which allowed me to iterate through days easily.

I accommodated for times going past midnight (start time > end time) by doing 2 checks on the segment in `opening_hours`: if the day is correct, it checks the duration from start time to the end of the day (1440 is the number of minutes in a day). If the the day isn't correct, then it checks through the day(s) adding an index of 1, and checks the start of the day (0) until the end time (this check can be improved - detailed under future improvements). Days going past Sunday use modulus % 7 so day indexes don't go past the highest day index of 7.

I have followed the constructor pattern for consistency when creating the date object, though I am much more familiar with factory functions.

`.find()` was used when checking the segments under `opening_hours` because there is no need to check further segments if we know the restaurant is open at that time.

I chose to read the `restaurant_data.json` using `require()` instead of `fs.readFile()` because using `require()` caches the file and is suitable for this context seeing that its contents are static.

Eslint used to ensure consistent conventions (using AirBnB standard), and 2 spaces indents allows more code to be visibly seen.

I kept the structure flat since this is not a complicated project and makes it easier to navigate to files. Having the helper functions in one file would also make it easier to see what's going on when following along the code, although the file was starting to get large.

One solution I thought about was converting the `opening_hours` string for each restaurant into a lookup object. It would be an object with the open days as the keys, and the value would be an array of objects, with each object key:value being startTime:endTime. It would look something like `{ "Mon": [{300:360}], ... }` but this would have to be done in the constructor with the given skeleton. It is good practice to avoid logic in the constructor.

Test cases could have been added for the helper functions but the primary focus of this assignment is testing the querying function `getRestaurantsOpenAt` so that's what I focused on.

Testing packages have been added to the dependencies rather than devDependencies since running tests is essential for this assignment.

## Improvements

Improvements could be made to the efficiency of my day and time checks done by the function `checkDates`. This only applies to opening hour's segment where times go past midnight (start time > end time). A better way would be:
- if the user's input day matches any of the segment days (e.g. `Sat-Tue`) but the time duration is wrong (start time to end of day), we check then check that day's start of day to end time. Return.
- if the user's input day doesn't match the segment days, check one day past the last segment day and see if user's time falls between that day's start of day to end time. Return.
This ensures that only 1 call of `checkDates` is needed rather than doing 2 (line 125-130).

Could use the `pre-commit` npm package, which only accepts the commit once tests have run and been successful. This would guarantee that tests are run before being committed rather than having to rely on memory.

Having varying logging levels using Winston so error logs triggered by test cases don't show up

## Future improvements

Improvements to the testing could be isolating the testing of a function to everything that doesn't include inner function calls. For example, `getRestaurantsOpenAt` calls `checkOpeningDaysAndHours` but perhaps a better way to test would be using sinon stubs on`checkOpeningDaysAndHours` to return a pre-determined value, since we are only interested in testing what `getRestaurantsOpenAt` is doing. A test for `checkOpeningDaysAndHours` can be done separately, and its inner function calls would also be stubbed.

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

Interested in hearing feedback on:
- folder structure currently, and what a good folder structure might look like if the project becomes complex e.g. wanting to query restaurants that contain a specific dish, returning all restaurants within proximity, etc
- the solution I have used and what a better solution would be
- code readability
- formatting

## Glossary
- epoch: time elapsed since the start of specified period
- epoch day: minutes elapsed since 00:00 that day
- epoch week: days elapsed since Monday
- segment: one of the opening_hour portions (each separated by `;`)
- period: referring to day(s) the restaurant is open on
- duration: refering to times of the day the restaurant is open

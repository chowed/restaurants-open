/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const luxon = require('luxon');

const Restaurants = require('../app/restaurants');

const restaurantDataFile = '../restaurant_data.json';

describe('Restaurants class', () => {
  describe('#getRestaurantsOpenAt()', () => {
    let restaurants;

    beforeEach(() => {
      restaurants = new Restaurants(restaurantDataFile);
    });

    // Helper function that returns the restaurants open on a specific weekday
    // at a given time. Monday is weekday === 0, and Sunday is weekday === 6.
    const getRestaurantsOpenAt = ({ weekday, hour, minute = 0 }) => restaurants
      .getRestaurantsOpenAt(luxon.DateTime.local(2021, 5, 10 + weekday, hour, minute));

    it('reports restaurant with multi-day period', () => {
      expect(getRestaurantsOpenAt({ weekday: 0, hour: 9, minute: 0 })).to.deep.include(
        'Kayasa Restaurant',
      );
    });
    it('reports restaurant with single-day period', () => {
      expect(getRestaurantsOpenAt({ weekday: 6, hour: 14, minute: 0 })).to.deep.include(
        "World's Best Steakhouse",
      );
    });
    it('reports restaurant with input time the same as the start time', () => {
      expect(getRestaurantsOpenAt({ weekday: 0, hour: 8, minute: 30 })).to.deep.include(
        'Kayasa Restaurant',
      );
    });
    it('excludes restaurant with input time the same as the end time', () => {
      expect(getRestaurantsOpenAt({ weekday: 0, hour: 20, minute: 59 })).to.deep.include(
        'Kayasa Restaurant',
      );
      expect(getRestaurantsOpenAt({ weekday: 0, hour: 21, minute: 0 })).to.not.include(
        'Kayasa Restaurant',
      );
    });
    it('reports restaurant with multi-day period (past Sun)', () => {
      expect(getRestaurantsOpenAt({ weekday: 6, hour: 12, minute: 45 })).to.deep.include(
        'b : Lunch onwards to late night with Fri late night*',
      );
    });
    it('reports restaurant with multi-day period (past Sun) and time past midnight', () => {
      expect(getRestaurantsOpenAt({ weekday: 2, hour: 0, minute: 15 })).to.deep.include(
        'b : Lunch onwards to late night with Fri late night*',
      );
    });
    it('reports restaurant with single-day period with time past midnight', () => {
      expect(getRestaurantsOpenAt({ weekday: 2, hour: 0, minute: 15 })).to.deep.include(
        'f : Dinner Tue late night*',
      );
    });
    it('reports restaurant with multi-day period with time past midnight', () => {
      expect(getRestaurantsOpenAt({ weekday: 2, hour: 1, minute: 30 })).to.deep.include(
        'e : Dinner late evening*',
      );
    });
    it('reports restaurant re-opening later in the day', () => {
      expect(getRestaurantsOpenAt({ weekday: 3, hour: 20, minute: 0 })).to.deep.include(
        'a : Lunch place with Thu evening to late*',
      );
    });
    it('reports 2 specific restaurants open at 8:30 am on Mondays', () => {
      expect(getRestaurantsOpenAt({ weekday: 0, hour: 8, minute: 30 })).to.deep.equal([
        'Kayasa Restaurant',
        'd : Open 24/7 except at 5am*',
      ]);
    });
    it('reports 6 specific restaurants open at 11:30 am on Tuesdays', () => {
      expect(getRestaurantsOpenAt({ weekday: 1, hour: 11, minute: 30 })).to.deep.equal([
        'Kayasa Restaurant',
        'Tandoori Mahal',
        'The Golden Duck',
        "World's Best Steakhouse",
        'b : Lunch onwards to late night with Fri late night*',
        'd : Open 24/7 except at 5am*',
      ]);
    });
    it('reports 8 specific restaurants open at 3 pm on Wednesdays', () => {
      expect(getRestaurantsOpenAt({ weekday: 2, hour: 15, minute: 0 })).to.deep.equal([
        'Kayasa Restaurant',
        'Tandoori Mahal',
        'The Golden Duck',
        "World's Best Steakhouse",
        'd : Open 24/7 except at 5am*']);
    });
    it('reports 3 specific restaurants open at 11:30 pm on Thursdays', () => {
      expect(getRestaurantsOpenAt({ weekday: 3, hour: 23, minute: 30 })).to.deep.equal([
        'c : Lunch and late night*',
        'd : Open 24/7 except at 5am*',
      ]);
    });
    it('reports 6 specific restaurants open at 10:59 pm on Fridays', () => {
      expect(getRestaurantsOpenAt({ weekday: 4, hour: 22, minute: 59 })).to.deep.equal([
        'Tandoori Mahal',
        'The Golden Duck',
        "World's Best Steakhouse",
        'b : Lunch onwards to late night with Fri late night*',
        'c : Lunch and late night*',
        'd : Open 24/7 except at 5am*',
      ]);
    });
    it('reports 7 specific restaurants open at 5pm on Saturdays', () => {
      expect(getRestaurantsOpenAt({ weekday: 5, hour: 17 })).to.deep.equal([
        'Kayasa Restaurant',
        'Tandoori Mahal',
        'The Golden Duck',
        "World's Best Steakhouse",
        'b : Lunch onwards to late night with Fri late night*',
        'd : Open 24/7 except at 5am*',
      ]);
    });
    it('reports 0 restaurants open at 5 am on Sundays', () => {
      expect(getRestaurantsOpenAt({ weekday: 6, hour: 5 })).to.deep.equal([]);
    });
  });
});

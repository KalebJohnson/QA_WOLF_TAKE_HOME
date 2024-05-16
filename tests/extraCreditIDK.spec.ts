
const { createObjectCsvWriter } = require('csv-writer');
import { test, expect } from '@playwright/test';


//  just running the same stuff within the playwright test library,
//  editted the config to run this and just do it in all the pre config display ports and browsers
//  these tests run - I personally get some dep errors - but it will open the local gui and show the passing results.
//  ( or not passing if you don't have atleast the browser deps installed )
//  PS it takes a moment?

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('https://news.ycombinator.com/');
  });

  test('main navigation', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://news.ycombinator.com/');
  });
});


// converting the index.js node script into.. - well a test.
test.describe('articles on DOM', () => {
  test('Save Hacker News Articles', async ({ page }) => {
    // Go to Hacker News
    await page.goto('https://news.ycombinator.com');

    // Wait for the title elements to load
    await page.waitForSelector('tbody td.title');

    // Select all elements with class "title" within the tbody element (the parent)
    const titleElements = await page.$$eval('tbody td.title', (elms) => {
      return elms.map((el) => el?.textContent?.trim());
    });

    // Reduce to the first ten elements
    const firstTenTitles = titleElements.slice(0, 10);

    // Shape into an array of objects
    const titlesToObjects = firstTenTitles.map((title, index) => {
      return {
        itemNumber: index + 1,
        title: title
      };
    });

    // this isn't really needed right? cause the test should tell us if we got the titles ect? whatever.
    const csvWriter = createObjectCsvWriter({
      path: 'QAWolfTestResults.csv',
      header: [
        { id: 'itemNumber', title: 'Item Number' },
        { id: 'title', title: 'Title' },
      ]
    });

    // Write the data 
    csvWriter.writeRecords(titlesToObjects)
      .then(() => console.log('CSV complete!'))
      .catch((err) => console.error('we messed up writting a few items to a csv?:', err));
  });
})

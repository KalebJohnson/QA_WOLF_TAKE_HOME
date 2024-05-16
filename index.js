// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const { createObjectCsvWriter } = require('csv-writer');

// I worked out the basic scraper logic in this script - I also threw them in some test cases
// you can see it in the tests dir - just looked at the config and used the default path
// QA noob energy though

//////// JUST THROWN INTO ONE ASYNC FUNC ////////////////////

async function saveHackerNewsArticles() {
  // launch browser

  // headless true cause watching chromium pop up on run is annoying right?
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com");

  // asyn await the DOM element selector and specifically look for this class name
  await page.waitForSelector('tbody td.title');

  // select all elements with class "title" within the tbody element ( the parent )
  const titleElements = await page.$$eval('tbody span.titleline', (elms) => {
    return elms.map((elms) => elms.textContent.trim())
  });

  // because the page usually has more than 10 - we can just get them all and trim
  // yeah you can probably do nth children of the parent but idk - I like this.
  const reduceToFirstTen = titleElements.slice(0, 10);

  // close the browser we got what we need
  await browser.close();

  // shape into an array of objects - for CSV 
  const titlesToObjects = reduceToFirstTen.map((item, ind) => {
    return {
      itemNumber: ind + 1,
      title: item
    }
  });

  // declare a csv writter using a library/package ( csv-writer )
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
}



//////// JUST ANOTHER WAY WITH SHIFTED LOGIC, AND GRAB THE URLS TO THE ARTICLES! ///////////////////


// we can do this in a few ways to make it more "module" or broken up.
async function saveHackerNewsArticlesV2() {
  // launch browser

  // headless true cause watching chromium pop up on run is annoying right?
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com");

  // asyn await the DOM element selector and specifically look for this class name
  await page.waitForSelector('tbody td.title');

  // select all elements with class "title" within the tbody element ( the parent )
  const titleElements = await page.$$eval('tbody span.titleline', (elms) => {
    return elms.map((el) => {
      const title = el.textContent.trim();
      const href = el.querySelector('a').href; // Get the href from the <a> tag
      return { title, href };
    });
  });

  console.log(titleElements)

  // close the browser we got what we need
  await browser.close();

  // because the page usually has more than 10 - we can just get them all and trim
  // yeah you can probably do nth children of the parent but idk - I like this.
  const reduceToFirstTen = titleElements.slice(0, 10);

  // shape into an array of objects - for CSV 
  const titlesToObjects = reduceToFirstTen.map((item, ind) => {
    return {
      itemNumber: ind + 1,
      title: item.title,
      href: item.href
    }
  });

  return titlesToObjects
}

function writeDataSetToCSV(data, headers) {


  // declare a csv writter using a library/package ( csv-writer )
  const csvWriter = createObjectCsvWriter({
    path: 'QAWolfTestResults.csv',
    header: headers
  });

  // Write the data 
  csvWriter.writeRecords(data)
    .then(() => console.log('CSV complete!'))
    .catch((err) => console.error('we messed up writting a few items to a csv?:', err));
}



//////////// RUN TEST CASES HERE //////////////////

async function runTest(testType) {

  if (testType === 'v2') {
    // scrape the articles and return them
    const articles = await saveHackerNewsArticlesV2();

    // write the results to a CSV
    return writeDataSetToCSV(articles, [
      { id: 'itemNumber', title: 'Item Number' },
      { id: 'title', title: 'Title' },
      { id: 'href', title: 'URL' },
    ])
  } else {
    saveHackerNewsArticles()
  }

}


runTest('v2')

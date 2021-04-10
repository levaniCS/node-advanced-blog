jest.setTimeout(30000)


const Page = require('./helpers/page')

let page

// Automaticly envoked for every test before it runs
beforeEach(async () => {
  page = await Page.build()
  await page.goto('localhost:3000');
})
// Automaticly envoked for every test after it runs
afterEach(async () => {
  await page.close()
})

test('When logged in, can see blog create form', async () => {
  await page.login()
  await page.click('a.btn-floating')
  const label = await page.getContentsOf('form label')
  expect(label).toEqual('Blog Title')
})
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

test('the header has the correct text', async () => {
  const text = await page.getContentsOf('a.brand-logo')
  expect(text).toEqual('Blogster')
}) 

test('clicking login starts oauth flow', async () => {
  await page.click('.right a')

  const url = await page.url()
  expect(url).toMatch(/accounts\.google\.com/)
})

// const id = '6069f17a9483632498068d89'
test('When signed in, shows logout button', async () => {
  await page.login()
  const text = await page.getContentsOf('a[href="/auth/logout"]')

  expect(text).toEqual('Logout')
})
import { mkdir, writeFile } from 'node:fs/promises'

const screenshotDir = new URL('../docs/screenshots/', import.meta.url)
await mkdir(screenshotDir, { recursive: true })
const targets = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5173', { method: 'PUT' }).then((response) => response.json())
const socket = new WebSocket(targets.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 0
const pending = new Map()
const events = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  } else if (message.method) {
    for (const listener of events.get(message.method) || []) listener(message.params)
  }
})

function on(method, listener) {
  const listeners = events.get(method) || []
  listeners.push(listener)
  events.set(method, listeners)
}

function send(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve) => pending.set(id, resolve))
}

async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (response.result.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description || response.result.exceptionDetails.text)
  return response.result.result.value
}

async function pauseNextAnalysis() {
  let continueRequest
  const paused = new Promise((resolve) => { continueRequest = resolve })
  on('Fetch.requestPaused', (params) => continueRequest(params))
  return paused
}

async function capture(name) {
  await new Promise((resolve) => setTimeout(resolve, 250))
  const image = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true })
  await writeFile(new URL(name, screenshotDir), Buffer.from(image.result.data, 'base64'))
}

async function reload() {
  await send('Page.navigate', { url: 'http://localhost:5173' })
  await new Promise((resolve) => setTimeout(resolve, 600))
}

await send('Page.enable')
await send('Runtime.enable')
await send('Fetch.enable', { patterns: [] })
await reload()
await capture('01-empty-state.png')

const blankError = await evaluate(`(() => {
  const box = document.querySelector('#single-input');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(box, '   ');
  box.dispatchEvent(new Event('input', { bubbles: true }));
  return document.querySelector('.analyze-button').disabled;
})()`)

await send('Fetch.enable', { patterns: [{ urlPattern: '*://localhost:8080/api/analyze*' }] })
const pausedPromise = pauseNextAnalysis()
await evaluate(`(() => {
  const box = document.querySelector('#single-input');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(box, 'Congratulations, you were selected for an internship. Pay a registration fee today to reserve your offer.');
  box.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.analyze-button').click();
})()`)
const pausedRequest = await pausedPromise
await new Promise((resolve) => setTimeout(resolve, 250))
const loadingVisible = await evaluate(`document.querySelector('.loading-note')?.textContent.includes('Reviewing') && document.querySelector('.analyze-button').disabled`)
await capture('02-loading-state.png')
await send('Fetch.continueRequest', { requestId: pausedRequest.requestId })
await send('Fetch.disable')
await new Promise((resolve) => setTimeout(resolve, 500))
const singleResultVisible = await evaluate(`Boolean(document.querySelector('.risk-card') && document.querySelector('.checklist-panel'))`)
await capture('03-message-result.png')

await evaluate(`document.querySelectorAll('.check-item input').forEach((box) => box.click())`)
const checklistComplete = await evaluate(`document.querySelector('.checklist-recommendation')?.textContent.includes('does not prove') && document.querySelector('.checklist-progress span:last-child')?.textContent === '5 / 5'`)
await capture('04-checklist-complete.png')

await reload()
await evaluate(`[...document.querySelectorAll('.mode-switch button')].find((button) => button.textContent.includes('conversation')).click()`)
await new Promise((resolve) => setTimeout(resolve, 150))
await evaluate(`(() => {
  const box = document.querySelector('#conversation-input');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(box, 'Congratulations! You have been selected for an internship.\\nPlease pay a registration fee today to reserve your place.\\nPay immediately or your offer will be cancelled.');
  box.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.analyze-button').click();
})()`)
await new Promise((resolve) => setTimeout(resolve, 700))
const conversationResultVisible = await evaluate(`Boolean(document.querySelector('.timeline-panel') && document.querySelector('.pattern-panel'))`)
await capture('05-conversation-result.png')

await reload()
await evaluate(`[...document.querySelectorAll('.input-kind-switch button')].find((button) => button.textContent.includes('URL pattern')).click()`)
await new Promise((resolve) => setTimeout(resolve, 150))
await evaluate(`(() => {
  const box = document.querySelector('#single-input');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(box, 'http://192.0.2.1/login/verify');
  box.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.analyze-button').click();
})()`)
await new Promise((resolve) => setTimeout(resolve, 700))
const urlResultVisible = await evaluate(`Boolean(document.querySelector('.risk-card') && document.querySelector('.evidence-panel')?.textContent.includes('ip host'))`)
await capture('06-url-result.png')

await reload()
await evaluate(`[...document.querySelectorAll('.mode-switch button')].find((button) => button.textContent.includes('conversation')).click()`)
await new Promise((resolve) => setTimeout(resolve, 150))
await evaluate(`(() => {
  const box = document.querySelector('#conversation-input');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(box, '   ');
  box.dispatchEvent(new Event('input', { bubbles: true }));
})()`)
const emptyDisabled = await evaluate(`document.querySelector('.analyze-button').disabled`)

await reload()
await evaluate(`[...document.querySelectorAll('.input-kind-switch button')].find((button) => button.textContent.includes('URL pattern')).click()`)
await new Promise((resolve) => setTimeout(resolve, 150))
await evaluate(`(() => {
  const box = document.querySelector('#single-input');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(box, 'ftp://example.invalid/login');
  box.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.analyze-button').click();
})()`)
const validationErrorVisible = await evaluate(`document.querySelector('[role="alert"]')?.textContent.includes('http:// or https://')`)
await capture('07-validation-error.png')

const checks = { blankInputPreventsSubmission: blankError, loadingStateVisible: loadingVisible, singleMessageResultVisible: singleResultVisible, checklistCompletionBehavior: checklistComplete, conversationTimelineAndPatternsVisible: conversationResultVisible, urlEvidenceVisible: urlResultVisible, blankConversationSubmitDisabled: emptyDisabled, invalidUrlShowsValidationError: validationErrorVisible }
console.log(JSON.stringify({ ...checks, screenshots: 7 }, null, 2))
if (Object.values(checks).some((passed) => !passed)) process.exitCode = 1
socket.close()

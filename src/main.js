function convertAnchorToOption(anchor) {
  const option = document.createElement('option')

  option.value = anchor.href
  option.text = anchor.text

  return option
}

function buildDatalistFromAnchors(anchors) {
  const datalist = document.createElement('datalist')
  const optionsFragment = document.createDocumentFragment()

  for (i = 0, l = anchors.length; i < l; i++) {
    const anchor = anchors[i]

    anchor.addEventListener('click', handleAnchorClick, false)

    const option = convertAnchorToOption(anchor)
    optionsFragment.appendChild(option)
  }

  datalist.id = 'x-datalist'
  datalist.append(optionsFragment)

  return datalist
}

function buildInputForDatalist(datalist) {
  const input = document.createElement('input')

  input.id = 'x-input'
  input.setAttribute('autofocus', 'autofocus')
  input.setAttribute('list', datalist.id)

  return input
}

function buildForm(input) {
  const form = document.createElement('form')
  form.id = 'x-form'
  form.addEventListener('submit', handleSubmit, false)

  const label = document.createElement('label')
  label.id = 'x-label'
  label.innerHTML = 'Search'
  label.setAttribute('for', input.id)

  const submit = document.createElement('button')
  submit.setAttribute('type', 'submit')
  submit.innerHTML = 'Open'

  form.appendChild(label)
  form.appendChild(input)
  form.appendChild(submit)

  return form
}

function buildIframe() {
  const iframe = document.createElement('iframe')
  iframe.id = 'x-iframe'

  return iframe
}

function buildCredit() {
  const credit = document.createElement('a')

  credit.setAttribute('href','https://github.com/matyus/classtab-navigator')
  credit.setAttribute('target', '_blank')
  credit.id = 'x-credit'
  credit.innerHTML = 'Source code'

  return credit
}

function buildApp(enabled) {
  const app = document.createElement('div')
  app.id = 'x-app'

  if (enabled) {
    app.removeAttribute('hidden')
  } else {
    app.setAttribute('hidden', 'hidden')
  }

  // find all the links on the page that point to .txt files
  const anchors = document.querySelectorAll('[href$=txt]')
  const datalist = buildDatalistFromAnchors(anchors)
  const input = buildInputForDatalist(datalist)
  const form = buildForm(input)
  const iframe = buildIframe()
  const credit = buildCredit()

  app.appendChild(datalist)
  app.appendChild(form)
  app.appendChild(iframe)
  app.append(credit)

  return app
}

function handleSubmit(event) {
  event.preventDefault()

  const { value } = event.target['x-input']

  // sommetimes the value can be whatever the user typed
  // rather than a value from the datalist
  if (/http(.+)classtab.org(.+).txt/.test(value)) {
    document.getElementById('x-iframe').src = value
  }
}

function handleAnchorClick(event) {
  const enabled = !document.getElementById('x-app').hidden

  // only hijack the click handling if the app is enabled at the time this event occurs
  if (enabled) {
    event.preventDefault();

    document.getElementById('x-iframe').src = event.target.href

    return false
  }
}

async function init() {
  const { enabled } = await chrome.storage.local.get('enabled')
  const app = buildApp(enabled)
  document.body.prepend(app)
}

init()

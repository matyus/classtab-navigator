function convertAnchorToOption(link) {
  const option = document.createElement('option')

  option.value = link.href
  option.text = link.text

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

function buildApp() {
  const container = document.createElement('div')
  container.id = 'x-container'

  // find all the links on the page that point to .txt files
  const anchors = document.querySelectorAll('[href$=txt]')
  const datalist = buildDatalistFromAnchors(anchors)
  const input = buildInputForDatalist(datalist)
  const form = buildForm(input)
  const iframe = buildIframe()

  container.appendChild(datalist)
  container.appendChild(form)
  container.appendChild(iframe)

  return container
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
  event.preventDefault();

  document.getElementById('x-iframe').src = event.target.href

  return false
}

function init() {
  const container = buildApp()
  document.body.prepend(container)
}

init()

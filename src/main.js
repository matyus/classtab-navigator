(function() {
  let enabled = false
  let tunings = {}
  let tuningsMode = false

  function convertAnchorToOption(anchor) {
    const option = document.createElement('option')

    option.value = anchor.href
    option.text = anchor.text

    return option
  }

  function buildAnchor(href) {
    const anchor = document.createElement('a')

    anchor.href = href
    anchor.innerHTML = href

    return anchor
  }

  function buildTuningInput(anchor) {
    const input = document.createElement('input')
    const path = anchor.href.replace('https://www.classtab.org/', '')

    input.value = tunings[path] ?? ''
    input.dataset.href = path
    input.classList.add('x-tuning')
    input.addEventListener('keyup', handleTuningInputChange, false)

    return input
  }

  function buildDatalistFromAnchors(anchors) {
    const datalist = document.createElement('datalist')
    const optionsFragment = document.createDocumentFragment()

    for (i = 0, l = anchors.length; i < l; i++) {
      const anchor = anchors[i]

      anchor.insertAdjacentElement('beforebegin', buildTuningInput(anchor))
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
    const tuningsButton = document.createElement('button')
    tuningsButton.id = 'x-tunings-button'
    tuningsButton.innerHTML = tuningsMode ? '□' : '◧'
    tuningsButton.title = 'Toggle tunings mode'
    tuningsButton.addEventListener('click', handleTuningsClick, false)

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

    form.appendChild(tuningsButton)
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

  function buildFooter() {
    const footer = document.createElement('span')
    footer.id = 'x-footer'
    footer.innerHTML = `
    <small>
      <a href="#" target="_blank" id="x-selected">—</a>
      <span>
        <a href="https://github.com/matyus/classtab-navigator" target="_blank">Source code</a> |
        <a href="https://www.pickupmusic.com/tools/guitar-tuner" target="_blank">Guitar Tuner</a>
      </span>
    </small>
    `

    return footer
  }

  function buildApp() {
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

    app.appendChild(datalist)
    app.appendChild(form)
    app.appendChild(buildIframe())
    app.appendChild(buildFooter())

    return app
  }

  function handleSubmit(event) {
    event.preventDefault()

    const { value } = event.target['x-input']

    // sommetimes the value can be whatever the user typed
    // rather than a value from the datalist
    if (/http(.+)classtab.org(.+).txt/.test(value)) {
      document.getElementById('x-iframe').src = value
      document.getElementById('x-selected').innerHTML = value
    }
  }

  function handleAnchorClick(event) {
    const enabled = !document.getElementById('x-app').hidden

    // only hijack the click handling if the app is enabled at the time this event occurs
    if (enabled) {
      event.preventDefault();

      document.getElementById('x-iframe').src = event.target.href
      document.getElementById('x-selected').replaceChildren(buildAnchor(event.target.href))

      return false
    }
  }

  function handleTuningsClick(event) {
    event.preventDefault()

    tuningsMode = !tuningsMode
    
    chrome.storage.local.set({ tuningsMode }, () => {
      if (tuningsMode) {
        document.body.classList.add('x-tunings-mode-off')
        event.target.innerHTML = '□'
      } else {
        document.body.classList.remove('x-tunings-mode-off')
        event.target.innerHTML = '◧'
      }

      console.log('Tunings', tuningsMode)
    })
  }

  async function handleTuningInputChange(event) {
    event.preventDefault()

    tunings[event.target.dataset.href] = event.target.value.trim()

    await chrome.storage.local.set({ tunings })
  }

  async function init() {
    const { enabled: _enabled, tunings: _tunings, tuningsMode: _tuningsMode } = await chrome.storage.local.get(['enabled', 'tunings', 'tuningsMode'])

    enabled = _enabled || false
    tunings = _tunings || {}
    tuningsMode = _tuningsMode || false

    if (tuningsMode) {
      document.body.classList.add('x-tunings-mode-off')
      //document.getElementById('x-tunings-button').innerHTML = '◧'
    } else {
      document.body.classList.remove('x-tunings-mode-off')
      //document.getElementById('x-tunings-button').innerHTML = '□'
    }
    console.log(document.getElementById('x-tunings-button'))
    const app = buildApp()
    document.body.prepend(app)
  }

  init()
})()
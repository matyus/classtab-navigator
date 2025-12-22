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

  function buildAnchor({ href, name, target, id }) {
    const anchor = document.createElement('a')

    anchor.id = id
    anchor.href = href
    anchor.innerHTML = name || href

    if (target) {
      anchor.setAttribute('target', target)
    }

    return anchor
  }

  function buildTuningInput(anchor) {
    const path = anchor.href.replace('https://www.classtab.org/', '')
    const input = document.createElement('input')

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

  function buildFooter() {
    const tuningsButton = document.createElement('button')
    tuningsButton.id = 'x-tunings-button'
    tuningsButton.innerHTML = tuningsMode ? 'Hide tunings' : 'Show tunings'
    tuningsButton.title = 'Toggle tunings mode'
    tuningsButton.addEventListener('click', handleTuningsClick, false)

    const selected = buildAnchor({ href: '#', target: '_blank', name: '—', id: 'x-selected' })
    const sourceCode = buildAnchor({ href: 'https://github.com/matyus/classtab-navigator', target: '_blank', name: 'Source code' })
    const guitarTuner = buildAnchor({ href: 'https://www.pickupmusic.com/tools/guitar-tuner', target: '_blank', name: 'Guitar Tuner' })

    const left = document.createElement('span')
    left.appendChild(tuningsButton)
    left.appendChild(selected)

    const right = document.createElement('span')
    right.appendChild(sourceCode)
    right.appendChild(document.createTextNode(' | '))
    right.appendChild(guitarTuner)

    const footer = document.createElement('span')
    footer.id = 'x-footer'
    footer.appendChild(left)
    footer.appendChild(right)

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
      setIframeSource(value)
      setSelectedLink(value)
    }
  }

  function handleAnchorClick(event) {
    const enabled = !document.getElementById('x-app').hidden

    // only hijack the click handling if the app is enabled at the time this event occurs
    if (enabled) {
      event.preventDefault();

      setIframeSource(event.target.href)
      setSelectedLink(event.target.href)

      return false
    }
  }

  function handleTuningsClick(event) {
    event.preventDefault()

    tuningsMode = !tuningsMode
    
    chrome.storage.local.set({ tuningsMode }, () => {
      if (tuningsMode) {
        document.body.classList.remove('x-tunings-mode-off')
        event.target.innerHTML = 'Hide tunings'
      } else {
        document.body.classList.add('x-tunings-mode-off')
        event.target.innerHTML = 'Show tunings'
      }
    })
  }

  function setIframeSource(href) {
    document.getElementById('x-iframe').src = href
  }

  function setSelectedLink(href) {
    const link = document.getElementById('x-selected')
    
    link.setAttribute('href', href)
    link.innerHTML = href.replace('https://www.classtab.org/', '')
  }

  function handleTuningInputChange(event) {
    event.preventDefault()

    tunings[event.target.dataset.href] = event.target.value.trim()

    chrome.storage.local.set({ tunings })
  }

  async function init() {
    const { enabled: _enabled, tunings: _tunings, tuningsMode: _tuningsMode } = await chrome.storage.local.get(['enabled', 'tunings', 'tuningsMode'])

    enabled = _enabled || false
    tunings = _tunings || {}
    tuningsMode = _tuningsMode || false

    console.log('Tunings mode', tuningsMode)

    if (tuningsMode) {
      document.body.classList.remove('x-tunings-mode-off')
    } else {
      document.body.classList.add('x-tunings-mode-off')
    }

    const app = buildApp()
    document.body.prepend(app)
  }

  init()
})()
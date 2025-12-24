(async function() {
  let enabled = false
  let tunings = {}
  let tuningsMode = false
  let labels = {}
  let labelsMode = false

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
    input.name = path
    input.classList.add('x-tuning')
    input.addEventListener('keyup', handleTuningInputChange, false)

    return input
  }

  function buildDatalistFromAnchors(anchors) {
    const datalist = document.createElement('datalist')
    const optionsFragment = document.createDocumentFragment()

    for (i = 0, l = anchors.length; i < l; i++) {
      const anchor = anchors[i]
      const label = labels[anchor.href.replace('https://www.classtab.org/', '')]

      if (label) {
        anchor.classList.remove('x-label', 'red', 'green', 'blue', 'yellow', 'purple')
        anchor.classList.add('x-label', label)
      } 

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
    tuningsButton.innerHTML = 'Tunings'
    tuningsButton.title = 'Toggle tunings mode'
    tuningsButton.addEventListener('click', handleTuningsClick, false)

    const labelsButton = document.createElement('button')
    labelsButton.id = 'x-labels-button'
    labelsButton.innerHTML = 'Labels'
    labelsButton.title = 'Toggle labels mode'
    labelsButton.addEventListener('click', handleLabelsClick, false)

    const selected = buildAnchor({ href: '#', target: '_blank', name: '—', id: 'x-selected' })
    const sourceCode = buildAnchor({ href: 'https://github.com/matyus/classtab-navigator', target: '_blank', name: 'Source code' })
    const guitarTuner = buildAnchor({ href: 'https://www.pickupmusic.com/tools/guitar-tuner', target: '_blank', name: 'Guitar Tuner' })

    const left = document.createElement('span')
    left.appendChild(tuningsButton)
    left.appendChild(labelsButton)
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
      document.body.classList.toggle('x-tunings-mode-off', !tuningsMode)
    })
  }

  function handleLabelsClick(event) {
    event.preventDefault()

    labelsMode = !labelsMode

    chrome.storage.local.set({ labelsMode }, () => {
      document.body.classList.toggle('x-labels-mode-on', labelsMode)
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

    tunings[event.target.name] = event.target.value.trim()

    chrome.storage.local.set({ tunings })
  }

  async function init() {
    const { 
      enabled: _enabled, 
      tunings: _tunings, 
      tuningsMode: _tuningsMode, 
      labels: _labels,
      labelsMode: _labelsMode
    } = await chrome.storage.local.get(['enabled', 'tunings', 'tuningsMode', 'labels', 'labelsMode'])

    enabled = _enabled || false
    tunings = _tunings || {}
    tuningsMode = _tuningsMode || false
    labels = _labels || {}
    labelsMode = _labelsMode || false

    if (Object.keys(tunings).length === 0) {
      await chrome.runtime.sendMessage({ type: 'set_default_tunings' })
      tunings = (await chrome.storage.local.get('tunings')).tunings || {}
    }

    if (!tuningsMode) {
      document.body.classList.add('x-tunings-mode-off')
    }

    if (labelsMode) {
      document.body.classList.add('x-labels-mode-on')
    }

    const app = buildApp()
    document.body.prepend(app)

    chrome.runtime.onMessage.addListener(async ({ type, path, label }) => {
      if (type === 'set_label') {
        const anchor = document.querySelector(`a[href="${path}"]`)

        if (anchor) {
          anchor.classList.remove('x-label', 'red', 'green', 'blue', 'yellow', 'purple')
          anchor.classList.add('x-label', label)
        }
      }
    })
  }

  await init()
})()
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
    const option = convertAnchorToOption(anchors[i])
    optionsFragment.appendChild(option)
  }

  datalist.id = 'x-links-datalist'
  datalist.append(optionsFragment)

  return datalist
}

function buildInputForDatalist(datalist) {
  const input = document.createElement('input')

  input.style.setProperty('box-sizing', 'border-box')
  input.style.setProperty('position', 'fixed')
  input.style.setProperty('top', 0)
  input.style.setProperty('left', 0)
  input.style.setProperty('margin', '1em')
  input.style.setProperty('width', '100%')
  input.style.setProperty('font-size', '3em')

  input.setAttribute('list', datalist.id)

  return input
}

function handleSelection(event) {
  window.location = event.target.value
}

function init() {
  const anchors = document.querySelectorAll('[href$=txt]')

  const datalist = buildDatalistFromAnchors(anchors)
  document.body.prepend(datalist)

  const input = buildInputForDatalist(datalist)
  input.addEventListener('change', handleSelection, false)
  document.body.prepend(input)
}

init()

const exportable = document.getElementById('exportable')
const codeFrame = document.getElementById('code-frame')
const backgroundInput = document.getElementById('background')
const backgroundCodeInput = document.getElementById('backgroundCode')
const exportButton = document.getElementById('export')
const infoFrame = document.getElementById('info-frame')
const sessionSelector = document.getElementById('session-selector')
const sessionNominator = document.getElementById('session-nominator')

const sessions = new Set(Array.from((getCookie('sessions') || 'DEFAULT').split(',')))
let sessionSelected = getCookie('session-selected')


if(!sessionSelected) {
  setDefaultState()
}
setConfig(sessionSelected)
initializeSessionSelector()


backgroundInput.addEventListener('change', () => changeBackgroundColor(exportable, backgroundInput.value))
backgroundCodeInput.addEventListener('change', () => changeBackgroundColor(codeFrame, backgroundCodeInput.value))
exportButton.addEventListener('click', exportAsJpg)
document.addEventListener('paste', onPaste);
sessionSelector.addEventListener('change', onChangeSelection)
sessionNominator.addEventListener('change', onChangeSession)


function setDefaultState() {
  backgroundInput.value = '#8A2BE2FF'
  backgroundCodeInput.value = '#282a36'
  sessionSelected = 'DEFAULT'
  setCookie('sessions', Array.from(sessions))
  setCookie('session-selected', 'DEFAULT')
  setCookie('DEFAULT', getConfig())
}

function initializeSessionSelector() {
  addSessionOption('add', 'Add Session')
  for(let session of sessions) {
    addSessionOption(session, session)
  }

  sessionSelector.value = sessionSelected
  sessionNominator.setAttribute('placeholder', sessionSelected)
}

function getConfig() {
  return JSON.stringify({
    background: backgroundInput.value,
    backgroundCode: backgroundCodeInput.value,
  })
}

function setConfig(session) {
  const config = JSON.parse(getCookie(session))
  backgroundInput.value = config.background
  backgroundCodeInput.value = config.backgroundCode

  changeBackgroundColor(exportable, backgroundInput.value)
  changeBackgroundColor(codeFrame, backgroundCodeInput.value)
}

function addSessionOption(value, text) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.innerHTML = text;
  sessionSelector.insertBefore(opt, sessionSelector.children[sessionSelector.children.length - 1]);
}

function onChangeSession(event) {
  const previousValue = sessionSelector.selectedOptions[0].value
  const value = event.target.value
  if(sessionSelector.value === 'add') {
    addSessionOption(value, value)
    sessions.add(value)
  } else {
    sessions.delete(previousValue)
    sessions.add(value)
    sessionSelector.selectedOptions[0].value = value
    sessionSelector.selectedOptions[0].innerText = value
  }
  sessionSelector.value = value

  eraseCookie(previousValue)
  setCookie(value, getConfig())
  setCookie('session-selected', value)
  setCookie('sessions', Array.from(sessions))
}

function onChangeSelection(event) {
  const session = event.target.value
  const placeholder = session === 'add' ? 'set a name to current session' : session
  sessionNominator.value = ''
  sessionNominator.setAttribute('placeholder', placeholder)
  setCookie('session-selected', session)
  setConfig(session)
}

function onPaste(event) {
  const clipboardItems = event.clipboardData.items;
  const items = Array.from(clipboardItems).filter(function (item) {
    return item.type.includes('image');
  });
  if (items.length === 0) {
    return;
  }

  infoFrame.style.display = 'none'

  const item = items[0];
  const blob = item.getAsFile();

  const imageUrl = window.URL.createObjectURL(blob);
  document.getElementById('code').src = imageUrl;
}

function exportAsJpg() {
  domtoimage.toJpeg(exportable).then(function (blob) {
    window.saveAs(blob, 'code-to-post.png');
  });
}

function changeBackgroundColor(element, value) {
  element.style.backgroundColor = value
  setCookie(sessionSelector.value, getConfig())
}
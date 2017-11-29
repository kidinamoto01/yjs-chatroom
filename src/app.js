/* global Y */
const Y = require('yjs')
require('y-memory')(Y) // extend Y with the memory module
require('y-websockets-client')(Y)
require('y-array')(Y)
require('y-map')(Y)
require('y-text')(Y)

// initialize a shared object. This function call returns a promise!
Y({
  db: {
      name: 'memory' // use memory database adapter.
            // name: 'indexeddb' // use indexeddb database adapter instead for offline apps
  },
  connector: {
    name: 'websockets-client',
    room: 'chat-example'
  },
   share: { // specify the shared content
     map: 'Map',    // y.share.map is of type Y.Map
    array: 'Array' // y.share.array is of type Y.Array
  }
}).then(function (y) {

window.yChat = y

console.log('Yjs instance ready!')


//var chatprotocol =  y.share.map.set('array', Y.Array)
var chatprotocol =  y.share.array

//  var msg = {
//     username: 'admin',
//     message: 'welcome'
//   }
// chatprotocol.insert(0,[msg])
// chatprotocol.insert(chatprotocol.length,[msg])
var chatcontainer = document.querySelector('#chat')
// This functions inserts a message at the specified position in the DOM
function appendMessage (message, position) {
  chatprotocol.length++
  console.log("length", chatprotocol.length)
  console.log("message",chatprotocol.toArray())
  
  var p = document.createElement('p')
  var uname = document.createElement('span')
  uname.appendChild(document.createTextNode(message.username + ': '))
  p.appendChild(uname)
  p.appendChild(document.createTextNode(message.message))
  console.log("insert in append message")
  chatcontainer.insertBefore(p, chatcontainer.children[position] || null)
}
// This function makes sure that only 7 messages exist in the chat history.
// The rest is deleted
function cleanupChat () {
  if (chatprotocol.length > 7) {
    chatprotocol.delete(0, chatprotocol.length - 7)
  }
}
// Insert the initial content
//console.log("first time",chatprotocol.length)
chatprotocol.toArray().forEach(appendMessage)
cleanupChat()

// whenever content changes, make sure to reflect the changes in the DOM
chatprotocol.observe(function (event) {
  console.log("content",chatprotocol.toArray())

  if (event.type === 'insert') {
    for (let i = 0; i < event.length; i++) {
      appendMessage(event.values[i], event.index + i)
    }
  } else if (event.type === 'delete') {
    for (let i = 0; i < event.length; i++) {
      chatcontainer.children[event.index].remove()
    }
  }
  // concurrent insertions may result in a history > 7, so cleanup here
  cleanupChat()
})


document.querySelector('#chatform').onsubmit = function (event) {
  // the form is submitted
  var message = {
    username: this.querySelector('[name=username]').value,
    message: this.querySelector('[name=message]').value
  }
  if (message.username.length > 0 && message.message.length > 0) {
    if (chatprotocol.length > 6) {
      // If we are goint to insert the 8th element, make sure to delete first.
      chatprotocol.delete(0)
    }
    // Here we insert a message in the shared chat type.
    // This will call the observe function (see line 40)
    // and reflect the change in the DOM
   
    chatprotocol.insert(chatprotocol.length,[message])
    console.log("push",chatprotocol.length)
    this.querySelector('[name=message]').value = ''
  }
  // Do not send this form!
  event.preventDefault()
  return false
}


})











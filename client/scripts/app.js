// YOUR CODE HERE:

var app = {
  init: init,
  addRoom: addRoom,
  changeRoom: changeRoom,
  updateRooms: updateRooms,
  send: send,
  fetch: fetch,
  clearMessages: clearMessages,
  addMessage: addMessage,
  handleSubmit: handleSubmit,
  addFriend: addFriend
};

//app.init();

function init() {
  // Rooms
  app.rooms = [];
  app.currentRoom = undefined;
  app.$rooms = $('#rooms');
  app.$roomSelector = $('#roomSelect');

  // Friends
  app.friends = [];

  // Fetching
  app.server = 'http://127.0.0.1:3000/1/classes/chatterbox';

  // Messages
  app.$userName = window.location.search.substring(10);
  app.$chats = $('#chats');
  app.$messageText = $('#message');
  app.$inputButton = $('#send');

  // Event Listeners
  app.$roomSelector.on('change', function(){
    if (this.value === ''){
      //do
    }else if (this.value === 'newRoom'){
      var newRoom = prompt('Please enter a room name:');
      app.addRoom(newRoom);
      app.changeRoom(newRoom);
    }else{
      app.changeRoom(this.value);
    }
  });

  app.$inputButton.on('click', function(e) {
    app.handleSubmit();
  });

  setInterval(function(){
    app.fetch(app.currentRoom);
  }, 1000);
}

function changeRoom(room) {
  app.clearMessages();
  app.currentRoom = room;
  app.fetch(app.currentRoom);
}

function clearMessages() {
  // https://api.jquery.com/empty/
  app.$chats.empty();
}

function addMessage(data) {
  data.results.forEach(function(message) {
    var template = _.template("<%-message%>");
    var isFriend = _.contains(app.friends, message.username) ? 'friendMessage' : '';
    var messageHtml = [
      '<div class="chat">',
        '<span class="username">',
          message.username,
        '</span ><span class="userTextBuffer">: </span>',
        '<span class="messageText ' + isFriend + '">',
          template({message: message.text}),
        '</span>',
        '<span class="timeStamp">',
          moment(message.createdAt).fromNow(),
        '</span>',
     '</div>'
    ].join('');
    var $message = $(messageHtml);

    $message.find('.username').click(function() {
      app.addFriend(message.username);
    });
    app.$chats.append($message);
  });
}

function addFriend(friendName) {
  if (app.friends.indexOf(friendName) === -1) {
    app.friends.push(friendName);
  }
  console.log(app.friends);
}


function createParseQuery(room) {
  if (room !== undefined){
    return {
      'order': '-createdAt',
      'where': {
        'roomname': {
          '$in': [room]
        }
      }
    };
  } else {
    return {
      'order': '-createdAt',
    };
  }
}

function fetch(room) {
  var JSONData = createParseQuery(room);
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: JSONData,
    success: function (data) {
      app.clearMessages();
      app.updateRooms(data);
      app.addMessage(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message. Error: ', data);
    }
  });
}

function handleSubmit(){
  var message = {
    username: app.$userName,
    text: app.$messageText.val(),
    roomname: app.currentRoom
  };

  app.send(message);
  app.$messageText.val('');
}

function addRoom(roomName) {
  app.rooms.push(roomName);
  var newOption = [
    '<option value="' + roomName + '"">',
      roomName,
    '</option>'
  ].join('');
  app.$roomSelector.append(newOption);
}

//OPTIONS
// function optional(message) {
//   $.ajax({
//     url: app.server,
//     type: 'OPTIONS',
//     data: JSON.stringify(message),
//     contentType: 'application/json',
//     success: function (data) {
//       console.log('chatterbox: Message sent. Data: ', data);
//     },
//     error: function (data) {
//       // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
//       console.error('chatterbox: Failed to send message. Error: ', data);
//     }
//   });
// }y

function send(message) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent. Data: ', data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message. Error: ', data);
    }
  });
}


function updateRooms(data) {
  //  get array of roomnames from data
  var rooms = data.results.map(function(val) {
    return val.roomname;
  }).reduce(function(prev, cur) {
    if (cur) {
      if (prev.indexOf(cur) === -1) {
        prev.push(cur);
      }
    }
    return prev;
  }, []);

  // add any rooms we don't already have
  _.difference(rooms, app.rooms).forEach(function(room) {
    app.rooms.push(room);
    var newOption = [
      '<option value="' + room + '"">',
        room,
      '</option>'
    ].join('');
    app.$roomSelector.append(newOption);
  });
}
// Queries that worked:
  // data: {roomName: 'lobby', order: '-createdAt'},
  // data: {'where': {'username': {'$in': ['pizza']}}},  // WORKING -- gets messages only from user 'pizza'
  // JSONData = {'limit': 10, 'where': {'username': {'$in': ['pizza']}}};

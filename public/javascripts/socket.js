var socket = io.connect('http://localhost');

//Bind listeners to the two static buttons
$(document).ready(function () {
    //Set all categories on all clients to button 2
    $('#setDefault').click(function () {
        socket.emit('setDefault', {});
    });

    //clear all categories on all clients
    $('#clear').click(function () {
        socket.emit('clear', {});
    });
});


// Server provides client with 10 random row numbers
// Pass that into handlebars to build the rows
socket.on('init', function (data) {
    var templateSource = $('#rows-template').html();
    var template = Handlebars.compile(templateSource);
    $('body').append(template(data));

    // Button is clicked, check whether currently active
    // Send message to server to toggle current status
    $('.dataButton[data-button-id!=""]').click(function (e) {
        var data = {};
        data.div = $(this).closest('div').attr('id');
        data.button = $(this).attr('data-button-id');
        if($(this).hasClass('active')){
            data.active = false;
        } else {
            data.active = true;
        }
        socket.emit('buttonPressed', data);
        e.stopPropagation();
    });
});

//Sets all buttons on client to button 2
socket.on('setDefault', function (data) {
    $('#responseText').text(data.msg);
    $('body').find('[data-button-id=' + data.button + ']').addClass('active');
});

//Clears all button selections
socket.on('clear', function (data) {
    $('.dataButton[data-button-id!=""]').removeClass('active');
});

// finds button in correct div and toggles status based on whether server feeds true or false
socket.on('setStatus', function (data) {
    if(data.active){
        $('#' + data.div).find('.dataButton[data-button-id="' + data.button + '"]').addClass('active');
    } else {
        $('#' + data.div).find('.dataButton[data-button-id="' + data.button + '"]').removeClass('active');
    }
});

//Update the span with the user count
socket.on('userUpdate', function(data){
   $('#userCount').text(data.userCount);
});
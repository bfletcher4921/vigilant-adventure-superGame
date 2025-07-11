// global variables
let playerName, winningHouse = ''; 
let playerScore = 0; 

document.addEventListener('DOMContentLoaded', () => {
  console.log('Game script loaded');
  
  // 1️⃣ Initialize the game, hide the game pieces, pick a winning house
  initializeGame();   
    
  // event to submit their name. Vanilla JS event listener 
  document.getElementById("submitPlayerName").addEventListener(
    "click", 
    ()=> 
      {
        greetPlayer()
      }
  );

  
  $('#playGame').on('click', ()=>{
    $('#goBox').addClass('d-flex').show(); 
    $('#gamePiece').show();
    $('#nameBox').removeClass('d-flex').hide(); 
    $('#playGame').prop('disabled', true); 
  });

  $('#playAgain').on('click', ()=>{
    $('#gamePiece').css({ left: 0, top: 0 }); 
    setKittysHouse(); 
     $("#gamePiece").draggable({ disabled: false });
     $(gameTargets).text(''); 


  }); 

  $('#resetGame').on('click', ()=>{
    initializeGame();
    
  }
)

  // drag & drop! 
// https://www.w3schools.com/howto/howto_js_draggable.asp
// https://jqueryui.com/draggable/



$("#gamePiece").draggable(
  {
    containment: "#gameBoard", scroll: true,
    snap: ".gameTargets", snapMode: "inner", 
    snapTolerance: 60
  }
);

 $('.gameTargets').droppable({
    accept: '#gamePiece',
    drop: function() {
       if($(this).attr('id') === $(gameTargets[winningHouse]).attr('id')) {
          playerScore++; 
          $(this).text('you winz!')
        }
        else {
          playerScore--; 
          $(this).text('you loze!')
        }
      
      $('#playerScore').text(playerScore);
      $('#playAgain').show(); 
      $("#gamePiece").draggable({ disabled: true });
      }
});

}); //ends doc ready f/n

//hide all controls from the start

function initializeGame() {
  
  // Hide the game piece
  $('#gamePiece').hide().css('display', 'none');  
  
  // clean winz/loze messages
  // $(gameTargets).text(''); 

  // Hide the controls except the first one (input name)
  //this was a struggle! Have to explicit remove the d-flex class
  $('#inputBox').addClass('d-flex').show(); 
  $('#nameBox').removeClass('d-flex').hide();  
  $('#goBox').removeClass('d-flex').hide(); 
  $('#playAgain').hide();
  //ensure the play btn is not disabled 
  $('#playGame').prop('disabled', false); 

  setKittysHouse(); 

  playerScore = 0; 
  $('#playerName').val(''); 
  $('#enteredPlayerName').val('').attr('placeholder', 'what\'s ur name?'); 
  $('#displayPlayerName').text(''); 
  playerName = ''; 
    

}

function setKittysHouse(){
  gameTargets = document.getElementsByClassName('gameTargets');
  //winning house is assigned random number 0,1,2 
  winningHouse = Math.floor(Math.random() * gameTargets.length);
  console.log( $(gameTargets[winningHouse]).attr('id'));

}

// greet the user (using jQ)
function greetPlayer(){
  //  console.log('in greetPlayer() f/n'); //I used these to debug, setting ⛳️ in my code
  const enteredPlayerName = $('#enteredPlayerName').val(); 
  // console.log(enteredPlayerName); //another ⛳️
  
  // 👇🏻 this checks to make sure a player name is entered!
  if (enteredPlayerName) {
    $('#displayPlayerName').prepend(`Get ready to help the kitty, ${enteredPlayerName}`);
    $('#playerName').val(''); 
    //todo: above, is this old code, need to delete? 
    
    //👇🏻 acknowledges their name & makes sure no red border 
    $('#enteredPlayerName')
      .attr('placeholder', 'Cool 😎') 
      .removeClass('redBorder');

    $('#nameBox').addClass('d-flex').show();  
    $('#inputBox').removeClass('d-flex').hide(); 
    
     $('#playGame').show(); 

  
  }
  else if(!enteredPlayerName) {
    console.log('no player name');
    //👇🏻 brings attention to no name 
    //👇🏻 set any DOM attribute https://www.w3schools.com/jquery/html_attr.asp
    $('#enteredPlayerName')
      .attr('placeholder', 'ppppllllleeeaaasssee enter ur name 😽')
      .addClass('redBorder')
      .focus(); 
    // https://api.jquery.com/toggleClass/
    // 👆🏻 did you know you can "chain" methods togehter. Above is really one line of code but split out with each .method() for readability (is that a word?)
      $('#displayPlayerName').text('');
      $('#playGame').hide(); 

  
  }
}
// global variables
let playerName, winningHouse = ''; 
let playerScore = 0; 
let gameTargets;
let backpackItems = []; // Track amount of crap in backpack
let gamePhase = 'toBackpack'; // 'toBackpack' or 'toHouse'

//Using jQuery's document ready instead of vanilla JS
$(document).ready(function() {
  // Initialize the game
  initializeGame();   
    
  // Submit player name
  $('#submitPlayerName').on('click', function() {
    greetPlayer();
  });

  // Play game button
  $('#playGame').on('click', function() {
    $('#goBox1').addClass('d-flex').show(); 
    // DON'T show goBox2 yet - only show it when backpack becomes main piece
    $('[id^="gamePiece"]').show();
    $('#nameBox').removeClass('d-flex').hide(); 
    $('#playGame').prop('disabled', true).hide(); 
    
    // Show initial instruction for backpack
    $('#goBox1').text('3️⃣ 👉Move all your crap 💩 to the backpack');
  });

  // Play again button
  $('#playAgain').on('click', function() {
    // Hide and clear goBox2 for reset
    $('#goBox2').removeClass('d-flex').hide().text('');
    
    // Reset game state
    backpackItems = []; // Clear backpack
    gamePhase = 'toBackpack'; // Reset to first phase
    
    // Reset positions and show pieces
    resetGamePiecePositions();
    
    // Ensure backpack is visible and reset
    $('#backPack').show().text(''); // Remove .text('BackPack')
    
    setKittysHouse(); 
    $('.gameTargets').text(''); 
    
    // Show goBox1 again and set initial instruction
    $('#goBox1').addClass('d-flex').show().text('3️⃣ 👉 Move all your crap 💩 to the backpack');
    
    // Hide game message
    $('#gameMessage').hide();
    
    // Hide Play Again button
    $('#playAgain').hide();
  }); 

  $('#resetGame').on('click', function() {
    initializeGame();
  });

  // Make all game pieces draggable
  $('[id^="gamePiece"]').draggable({
    containment: "#gameBoard", 
    scroll: true,
    snap: ".backpack-target, .gameTargets", 
    snapMode: "inner", 
    snapTolerance: 60,
    revert: function(dropped) {
      // Revert if not dropped on valid target
      if (!dropped) return true;
      
      // In backpack phase, only allow drops on backpack
      if (gamePhase === 'toBackpack' && !dropped.hasClass('backpack-target')) {
        return true;
      }
      
      // In house phase, only allow drops on house targets
      if (gamePhase === 'toHouse' && !dropped.hasClass('gameTargets')) {
        return true;
      }
      
      return false;
    }
  });

  // Make the backpack droppable (first part of game)
  $('#backPack').droppable({
    accept: '[id^="gamePiece"]',
    drop: function(event, ui) {
      const droppedPiece = ui.draggable.attr('id');
      
      if (gamePhase === 'toBackpack') {
        // Add item to backpack
        if (!backpackItems.includes(droppedPiece)) {
          backpackItems.push(droppedPiece);
          
          // Hide the piece completely
          ui.draggable.hide();
          
          // MOVED: Update goBox2 instead of backpack text
          $('#goBox2').text(`Crap collected: ${backpackItems.length}/4`).addClass('d-flex').show();
          
          // Check if all pieces are in backpack
          if (backpackItems.length >= 4) {
            gamePhase = 'toHouse';
            
            // Update goBox2 for the second phase
            $('#goBox2').text('4️⃣ All crap is packed! Now take the backpack o\' crap to the right place!');
            
            // Update instructions
            $('#goBox1').text('Great! All your crap is together! 🎒');
            
            // Hide all remaining pieces and make backpack draggable
            $('[id^="gamePiece"]').hide();
            $('[id^="gamePiece"]').draggable('disable');
            
            // Make the backpack the main game piece
            $(this).draggable({
              containment: "#gameBoard",
              snap: ".gameTargets",
              snapMode: "inner",
              snapTolerance: 60,
              cursor: "move",
              start: function() {
                $(this).css('opacity', '0.7');
              },
              stop: function() {
                $(this).css('opacity', '1');
              }
            });
           
          }
        }
      }
    }
  }).addClass('backpack-target'); // Add class for identification

  // Make house targets droppable (second part of game)
  $('.gameTargets').droppable({
    accept: '#backPack',
    drop: function(event, ui) {
      if (gamePhase === 'toHouse' && ui.draggable.attr('id') === 'backPack') {
        if ($(this).attr('id') === $(gameTargets[winningHouse]).attr('id')) {
          playerScore += backpackItems.length;
          
          // Hide both instruction boxes on winning
          $('#goBox1, #goBox2').removeClass('d-flex').hide();
          
          // Show success message
          $('#messageText').text('🎉 Perfect! You got it all together!');
          $('#gameMessage').removeClass('alert-danger').addClass('alert-success').show();
        } else {
          playerScore = Math.max(0, playerScore - 1);
          
          // Show error message  
          $('#messageText').text('❌ Wrong place! Try somewhere else.');
          $('#gameMessage').removeClass('alert-success').addClass('alert-danger').show();
          
          $('#backPack').css({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          });
          return;
        }
        
        $('#playerScore').text(playerScore);
        $('#playAgain').show();
        $('#backPack').draggable('destroy');
      }
    }
  });
});

function initializeGame() {
  console.log('Initializing game...');
  
  // Hide all game pieces and instruction boxes
  $('[id^="gamePiece"]').hide();
  $('#goBox2').removeClass('d-flex').hide().text(''); // Clear goBox2 text
  
  // Reset game state
  backpackItems = [];
  gamePhase = 'toBackpack';
  
  // Clear messages
  $('.gameTargets').text(''); 
  $('#gameMessage').hide(); // Hide any success/error messages
  
  // Reset backpack position but keep original styling
  $('#backPack').css({
    position: '',
    top: '',
    left: '',
    transform: '',
    opacity: '1'
  }).removeClass('main-game-piece').text('').show();

  // Reset UI elements
  $('#inputBox').addClass('d-flex').show(); 
  $('#nameBox').removeClass('d-flex').hide();  
  $('#goBox1').removeClass('d-flex').hide(); 
  $('#playAgain').hide();
  $('#playGame').prop('disabled', false); 

  // Reset positions but keep them hidden
  $('#gamePiece1').css({ left: '10px', top: '10px', position: 'absolute' }); 
  $('#gamePiece2').css({ left: '120px', top: '10px', position: 'absolute' }); 
  $('#gamePiece3').css({ left: '10px', top: '120px', position: 'absolute' }); 
  $('#gamePiece4').css({ left: '120px', top: '120px', position: 'absolute' }); 
  
  // Destroy any existing draggable on backpack
  if ($('#backPack').hasClass('ui-draggable')) {
    $('#backPack').draggable('destroy');
  }
  
  setKittysHouse(); 

  playerScore = 0; 
  $('#playerScore').text('0');
  $('#enteredPlayerName').val('').attr('placeholder', 'What\'s your name?'); 
  $('#displayPlayerName').text(''); 
  playerName = ''; 
}

function resetGamePiecePositions() {
  // Reset individual game pieces positions AND show them
  $('#gamePiece1').css({ left: '10px', top: '10px', position: 'absolute' }).show(); 
  $('#gamePiece2').css({ left: '120px', top: '10px', position: 'absolute' }).show(); 
  $('#gamePiece3').css({ left: '10px', top: '120px', position: 'absolute' }).show(); 
  $('#gamePiece4').css({ left: '120px', top: '120px', position: 'absolute' }).show(); 
  
  // Reset only specific properties, keep background image
  $('#backPack').css({
    position: '',       // Clear position
    top: '',           // Clear top
    left: '',          // Clear left  
    transform: '',     // Clear transform
    opacity: '1'       // Reset opacity
  }).removeClass('main-game-piece ui-draggable ui-draggable-handle')
    .text('')
    .show();
  
  // Re-enable game pieces dragging
  $('[id^="gamePiece"]').draggable({ disabled: false });
  
  // Completely remove backpack draggable functionality
  if ($('#backPack').hasClass('ui-draggable')) {
    $('#backPack').draggable('destroy');
  }
}

function setKittysHouse() {
  // Define valid targets (exclude bag)
  const validTargets = ['#museum', '#shop']; // Only these can win
  
  // Get jQuery objects for valid targets only
  gameTargets = $(validTargets.join(', '));
  
  winningHouse = Math.floor(Math.random() * gameTargets.length);
  console.log('Winning house:', $(gameTargets[winningHouse]).attr('id'));
  console.log('Bag is never the answer!');
}

function greetPlayer() {
  console.log('greetPlayer() called');
  const enteredPlayerName = $('#enteredPlayerName').val().trim();
  console.log('Player name:', enteredPlayerName);
  
  if (enteredPlayerName) {
    $('#displayPlayerName').text(`2️⃣Get ready to get your 💩 together, ${enteredPlayerName}! 👉`);
    
    // Remove error styling and show success, I am hiding this box anyways...prly should comment out
    $('#enteredPlayerName')
      .attr('placeholder', 'Cool 😎') 
      .removeClass('is-invalid border-danger border-success')
      .addClass('is-valid');

    $('#nameBox').addClass('d-flex').show();  
    $('#inputBox').removeClass('d-flex').hide(); 
    $('#playGame').show(); 
    
    playerName = enteredPlayerName;
  } else {
    console.log('No player name entered');
    
    // Show error for no player name entered
    $('#enteredPlayerName')
      .attr('placeholder', 'Please enter your name')
      .removeClass('is-valid')
      .addClass('is-invalid border-danger')
      .focus(); 
    
    $('#displayPlayerName').text('');
    $('#playGame').hide(); 
  }
}
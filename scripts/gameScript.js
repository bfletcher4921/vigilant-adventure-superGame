// global variables
let playerName, winningHouse = ''; 
let playerScore = 0; 
let gameTargets;
let backpackItems = []; // Track amount of crap in backpack
let gamePhase = 'toBackpack'; // 'toBackpack' or 'toHouse'

// Detect if the user is on a mobile device
// mobile version only half works- could fix
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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
    $('[id^="gamePiece"]').show();
    $('#nameBox').removeClass('d-flex').hide(); 
    $('#playGame').prop('disabled', true).hide(); 
    
    // Show initial instruction for backpack
    $('#goBox1').text('3️⃣ 👉Move all your crap 💩 to the backpack');
    
    // Initialize draggables
    initializeDraggables();
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
    
    // Re-initialize draggables
    initializeDraggables();
  }); 

  $('#resetGame').on('click', function() {
    initializeGame();
  });

  // Make all game pieces -backpack and crap pieces- draggable
  $('[id^="gamePiece"]').draggable({
    containment: "#gameBoard", 
    scroll: true,
    snap: ".backpackTarget, .gameTargets", 
    snapMode: "inner", 
    snapTolerance: 60,
    revert: function(dropped) {
      // Revert if not dropped on valid target
      if (!dropped) return true;
      
      // In backpack phase, only allow drops of crap on backpack
      if (gamePhase === 'toBackpack' && !dropped.hasClass('backpackTarget')) {
        return true;
      }
      
      // In house phase, only allow drops of backpack on house targets
      if (gamePhase === 'toHouse' && !dropped.hasClass('gameTargets')) {
        return true;
      }
      
      return false;
    },
    revertDuration: 300, // Add smooth revert animation
    stop: function(event, ui) {
      // Re-enable snapping after any drag operation- it's still not snapping to the new targets and I'm too tired to fix it
      $(this).draggable('option', 'snap', '.backpackTarget, .gameTargets');
      $(this).draggable('option', 'snapMode', 'inner');
      $(this).draggable('option', 'snapTolerance', 60);
    }
  });

  // Make the backpack droppable by adding all the crap first (first part of game)
  $('#backPack').droppable({
    accept: '[id^="gamePiece"]',
    drop: function(event, ui) {
      const droppedPiece = ui.draggable.attr('id');
      
      if (gamePhase === 'toBackpack') {
        // Add crap to backpack
        if (!backpackItems.includes(droppedPiece)) {
          backpackItems.push(droppedPiece);
          
          // Hide the piece completely
          ui.draggable.hide();
          
          //Update goBox2 with game crap collection progress
          $('#goBox2').text(`Crap collected: ${backpackItems.length}/4`).addClass('d-flex').show();
          
          // Check if all your crap is in the backpack
          if (backpackItems.length >= 4) {
            gamePhase = 'toHouse';
            
            // Update goBox2 for the second phase
            $('#goBox2').text('4️⃣ All crap is packed! Now take the backpack o\' crap to the right place!');
            
            // Update instructions
            $('#goBox1').text('Awesome! All your crap is together! 🎒');
            
            // Hide all remaining pieces aka crap and make backpack draggable
            $('[id^="gamePiece"]').hide();
            $('[id^="gamePiece"]').draggable('disable');
            
            // Make the backpack the main game piece- all the crap is now moved to it
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
  }).addClass('backpackTarget'); 

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
          $('#messageText').text('🎉 You got your crap together!');
          $('#gameMessage').removeClass('alert-danger').addClass('alert-success').show();
        } else {
          playerScore = Math.max(0, playerScore - 1);
          
          // Show error message  
          $('#messageText').text('❌ You failed to take your crap there! Try somewhere else.');
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
  
  // Add hover sound effects and visual feedback
  $('#backPack').hover(
    function() {
      // On hover in
      if (gamePhase === 'toBackpack') {
        $(this).addClass('ready-to-receive');
        $('#goBox1').text('Get your crap in the backpack! 🎒');
      } else if (gamePhase === 'toHouse') {
        $(this).addClass('ready-to-move');
        $('#goBox2').text('Take your crap somewhere');
      }
    },
    function() {
      // On hover out
      $(this).removeClass('ready-to-receive ready-to-move');
      // Restore original instructions
      if (gamePhase === 'toBackpack') {
        $('#goBox1').text('3️⃣ 👉Move all your crap 💩 to the backpack');
      }
    }
  );

  // Add filled state when items are added
  function updateBackpackState() {
    const $backpack = $('#backPack');
    
    if (backpackItems.length === 0) {
      $backpack.addClass('empty').removeClass('filled loading');
    } else if (backpackItems.length < 4) {
      $backpack.addClass('loading').removeClass('empty filled');
    } else {
      $backpack.addClass('filled').removeClass('empty loading');
    }
  }

  // Call updateBackpackState whenever items are added/removed

});

// Add this function to initialize/re-initialize draggables
function initializeDraggables() {
  $('[id^="gamePiece"]').each(function() {
    // Destroy existing draggable if it exists
    if ($(this).hasClass('ui-draggable')) {
      $(this).draggable('destroy');
    }
    
    // Initialize fresh draggable
    $(this).draggable({
      containment: "#gameBoard", 
      scroll: true,
      snap: ".backpackTarget, .gameTargets", 
      snapMode: "inner", 
      snapTolerance: isMobile ? 80 : 60, // Larger tolerance for mobile
      delay: isMobile ? 100 : 0, // Slight delay on mobile to distinguish from scrolling
      distance: isMobile ? 10 : 1, // Require more movement on mobile
      revert: function(dropped) {
        // Revert if not dropped on valid target
        if (!dropped) return true;
        
        // In backpack phase, only allow drops of crap on backpack
        if (gamePhase === 'toBackpack' && !dropped.hasClass('backpackTarget')) {
          return true;
        }
        
        // In house phase, only allow drops of crap on house targets
        if (gamePhase === 'toHouse' && !dropped.hasClass('gameTargets')) {
          return true;
        }
        
        return false;
      },
      revertDuration: 300,
      start: function() {
        if (isMobile) {
          $('body').addClass('dragging');
        }
      },
      stop: function(event, ui) {
        if (isMobile) {
          $('body').removeClass('dragging');
        }
        $(this).draggable('option', 'snap', '.backpackTarget, .gameTargets');
        $(this).draggable('option', 'snapMode', 'inner');
        $(this).draggable('option', 'snapTolerance', isMobile ? 80 : 60);
      }
    });
  });
}

function initializeGame() {
  console.log('Initializing game...');
  
  // Hide all game pieces and instruction boxes
  $('[id^="gamePiece"]').hide();
  $('#goBox2').removeClass('d-flex').hide().text(''); // Clear goBox2 text
  
  // Reset game 
  backpackItems = [];
  gamePhase = 'toBackpack';
  
  // Clear messages
  $('.gameTargets').text(''); 
  $('#gameMessage').hide(); // Hide any success/error messages
  
  // Reset backpack position 
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

  // Reset crap positions but keep them hidden
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
  // Reset individual game pieces aka crap positions AND show them
  $('#gamePiece1').css({ left: '10px', top: '10px', position: 'absolute' }).show(); 
  $('#gamePiece2').css({ left: '100px', top: '10px', position: 'absolute' }).show(); 
  $('#gamePiece3').css({ left: '10px', top: '100px', position: 'absolute' }).show(); 
  $('#gamePiece4').css({ left: '100px', top: '100px', position: 'absolute' }).show(); 
  
  // Reset backpack position
  $('#backPack').css({
    position: '',
    top: '',
    left: '',
    transform: '',
    opacity: '1'
  }).removeClass('main-game-piece ui-draggable ui-draggable-handle')
    .text('')
    .show();
  
  // Remove backpack draggable functionality- must be filled with crap
  if ($('#backPack').hasClass('ui-draggable')) {
    $('#backPack').draggable('destroy');
  }
  
  // Re-initialize draggables for game pieces
  initializeDraggables();
}

function setKittysHouse() {
  // Define valid targets (exclude bag)
  console.log('the bag is not a valid target for the backpack of crap')
  const validTargets = ['#museum', '#shop']; // Only these can win
  
  // Get jQuery objects for valid targets only
  gameTargets = $(validTargets.join(', '));
  
  winningHouse = Math.floor(Math.random() * gameTargets.length);
  console.log('Winning house:', $(gameTargets[winningHouse]).attr('id'));
  console.log('You failed to find the correct target!');
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

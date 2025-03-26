<script>
  import '$lib/styles/main.css';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount, afterUpdate } from 'svelte';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';
  import { page } from '$app/stores';
  import party from "party-js";
  import { getGridFromCookie, saveGridAsCookie, getEntriesFromCookie, saveEntriesAsCookie, deleteSavedGridCookie, isGameLockCookiePresent, addGameLockCookie, deleteGameLockCookie, deleteAllCookies } from '$lib/cookies.js';

  $: queryParams = $page.url.searchParams;
  $: bingocode = queryParams.get('bingo');

  let theme = 'light';

  let inputText = `Bingo Item 1
Bingo Item 2
Bingo Item 3
Bingo Item 4
Bingo Item 5
Bingo Item 6
Bingo Item 7
Bingo Item 8
Bingo Item 9
Bingo Item 10
Bingo Item 11
Bingo Item 12
Bingo Item 13
Bingo Item 14
Bingo Item 15
Bingo Item 16
Bingo Item 17
Bingo Item 18
Bingo Item 19
Bingo Item 20
Bingo Item 21
Bingo Item 22
Bingo Item 23
Bingo Item 24
Bingo Item 25`;

  let rows = 5;
  let cols = 5;
  let grid = [];
  let running_bingo = true;
  let tried_to_regen = false;
  let bingoCount = 0;

  let closeAlertButton = null;
  let alertBackground = null;
  let closeSettingsButton = null;
  let settingsBackground = null;

  function openAlert() {
    alertBackground.style.display = 'flex';
  }

  function closeAlert() {
    alertBackground.style.display = 'none';
  }

  function openSettings() {
    settingsBackground.style.display = 'flex';
  }

  function closeSettings() {
    settingsBackground.style.display = 'none';
  }


  function generateBingo() {
    if (running_bingo) {
      tried_to_regen = true;
      return;
    }
    const inputLines = inputText.split('\n').map(line => line.trim()).filter(Boolean);
    grid = Array(rows * cols).fill('');
    const shuffledLines = [...inputLines].sort(() => Math.random() - 0.5);
    shuffledLines.forEach((line, index) => {
      if (index < grid.length) {
        grid[index] = { value: line, clicked: false };
      }
    });
    grid = Array.from({ length: rows }, (_, rowIndex) =>
      grid.slice(rowIndex * cols, rowIndex * cols + cols)
    );
    saveEntriesAsCookie(inputText);
    saveGridAsCookie(grid);
  }

  function checkBingo() {
    // Check rows for bingo
    for (let row of grid) {
      if (row.every(cell => cell.clicked)) {
        return true; // Bingo detected in this row
      }
    }

    // Check columns for bingo
    for (let col = 0; col < grid[0].length; col++) {
      if (grid.every(row => row[col].clicked)) {
        return true; // Bingo detected in this column
      }
    }

    // Check diagonals for bingo
    if (grid.every((row, i) => row[i].clicked)) {
      return true; // Bingo detected in the top-left to bottom-right diagonal
    }

    if (grid.every((row, i) => row[grid.length - 1 - i].clicked)) {
      return true; // Bingo detected in the top-right to bottom-left diagonal
    }

    return false; // No bingo detected
  }

  function getBingoCount() {
    let bingoCount = 0; // To count the number of bingos

    // Check rows for bingo
    for (let row of grid) {
      if (row.every(cell => cell.clicked)) {
        bingoCount++; // Bingo detected in this row
      }
    }

    // Check columns for bingo
    for (let col = 0; col < grid[0].length; col++) {
      if (grid.every(row => row[col].clicked)) {
        bingoCount++; // Bingo detected in this column
      }
    }

    // Check top-left to bottom-right diagonal for bingo
    if (grid.every((row, i) => row[i].clicked)) {
      bingoCount++; // Bingo detected in the top-left to bottom-right diagonal
    }

    // Check top-right to bottom-left diagonal for bingo
    if (grid.every((row, i) => row[grid.length - 1 - i].clicked)) {
      bingoCount++; // Bingo detected in the top-right to bottom-left diagonal
    }

    return bingoCount; // Return the total count of bingos detected
  }

  function cellClicked() {
    saveGridAsCookie(grid);
    running_bingo = true;
    addGameLockCookie();
    // check if bingo achieved and new bingo count is larger than previous
    if (checkBingo() && getBingoCount() > bingoCount) {
      openAlert();
      triggerConfetti();
    }
    bingoCount = getBingoCount();
  }


  function resetBingo() {
    running_bingo = false;
    tried_to_regen = false;
    generateBingo();
    deleteGameLockCookie();
  }

  afterUpdate(() => {
    adjustFontSizes();
  });

  function adjustFontSizes() {
    const cells = document.querySelectorAll('.bingo-cell');
    cells.forEach(cell => {
      let fontSize = 18; // Base font size
      cell.style.fontSize = `${fontSize}px`;

      while (cell.scrollHeight > cell.clientHeight || cell.scrollWidth > cell.clientWidth) {
        fontSize--;
        cell.style.fontSize = `${fontSize}px`;
        if (fontSize < 8) break; // Minimum font size limit
      }
    });
  }

  async function downloadPDF() {
    const gridElement = document.querySelector('.bingo-grid');
    const canvas = await html2canvas(gridElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const padding = 40;

    // Create a jsPDF instance
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [canvas.width + padding * 2, canvas.height + padding * 2],
    });

    // Add the image to the PDF with padding
    pdf.addImage(imgData, 'PNG', padding, padding, canvas.width, canvas.height);

    // Save the PDF
    pdf.save('bingo-grid.pdf');
  }


  export function deleteGridCookieOnNotPlaying() {
    if (!isGameLockCookiePresent()) {
      deleteSavedGridCookie();
      running_bingo = false;
      tried_to_regen = false;
    }
  }

  function triggerConfetti() {
    // `party.confetti` can be used for screen-wide confetti
    party.confetti(document.body, {
      count: party.variation.range(50, 2000), // Number of confetti pieces
      spread: 70, // Spread of confetti
      size: party.variation.range(0.5, 1.5), // Size of confetti
    });
  }

  // Toggle between dark and light themes
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }

  onMount(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    const savedGrid = getGridFromCookie();
    const savedEntries = getEntriesFromCookie();

    closeAlertButton = document.getElementById('close-alert');
    alertBackground = document.getElementById('alert-background');
    closeAlertButton.addEventListener('click', closeAlert);
    closeSettingsButton = document.getElementById('close-settings');
    settingsBackground = document.getElementById('settings-background');
    closeSettingsButton.addEventListener('click', closeSettings);

    deleteGridCookieOnNotPlaying();

    if (savedGrid) {
      grid = savedGrid;
      if (savedEntries) {
        inputText = savedEntries;
      }
      bingoCount = getBingoCount();
    } else {
      running_bingo = false;
      generateBingo();
    }
  });
</script>

<head>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
</head>
<div class="root-bingo-container">
  <div class="flex-row-container">
    <div class="bingo-container bingo-main-container">
      <h1>Randomized Bingo Generator</h1>
      <div style="margin-bottom: 10px;">
      </div>
      <div class="notice-box">
        <div class="button-container">
          <button on:click={generateBingo}>Regenerate Bingo</button>
          <button on:click={downloadPDF}>Download as PDF</button>
          <button on:click={openSettings}>Configure Bingo</button>
        </div>
        {#if running_bingo && tried_to_regen}
          <div class="bingo-running-warning">
            <p>You are currently playing this game of Bingo and it therefore doesn't Refresh changes or Regenerate the table. If you would like to End the Game, Click the Button below.</p>
            <button on:click={resetBingo}>Stop Bingo and Regenerate</button>
          </div>
        {/if}
        {#if running_bingo && !tried_to_regen}
          <i style="margin-bottom: 10px;">A game is currently running. Changes made to the configuration are not being updated to the grid.</i>
        {/if}
      </div>
      <div class="notice-box cookie-notice">
        <p>This Website uses functional Cookies to store the Running Bingo Game, Settings and the Entered Bingo Entries.<br><br>They can be deleted in the Settings.</p>
      </div>
    </div>
    <div class="bingo-container bingo-grid-container">
      {#if grid.length > 0}
        <div class="bingo-grid" style="grid-template-columns: repeat({cols}, 1fr);">
          {#each grid as row}
            {#each row as cell}
              <button class="bingo-cell"
              on:click={() => { cell.clicked = !cell.clicked; cellClicked(); }}
              on:keydown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') { // Handle Enter or Space key
                  cell.clicked = !cell.clicked;
                  cellClicked();
                }
              }}
              class:clicked={cell.clicked}
              >{cell.value}</button>
            {/each}
          {/each}
        </div>
      {:else}
      <div class="centered-notice notice-box">
        <p>Click the Button to generate a new Bingo</p>
        <button on:click={generateBingo}>Generate Bingo</button>
      </div>
      {/if}
    </div>
  </div>

  <div id="alert-background" class="overlay-background">
    <div class="overlay-content">
      <h2>Bingo!</h2>
      <p>You achieved a new Bingo!<br>You now have <b>{bingoCount}</b> Bingos.</p>
      <button id="close-alert" class="close-btn">Close</button>
    </div>
  </div>

  <div id="settings-background" class="overlay-background">
    <div class="overlay-content settings-container">
      <h2>Bingo Settings</h2>
      <div class="flex-row-container">
        <div class="flex-row-item settings-box">
          <h3>Bingo Items</h3>
          <div class="settings-element">
            <p>NOTE: If there are more lines than Bingo cells, not all Items will be in the Bingo. The selection is still randomized.</p>
            <textarea class="bingo-item-input" bind:value={inputText} placeholder="Enter items line by line" on:input={generateBingo}></textarea>
          </div>
        </div>
        <div class="flex-row-item flex-column-container">
          <div class="settings-box flex-column-item">
            <h3>Bingo Dimensions</h3>
            <div class="settings-element">
              <label for="rows">Rows:</label>
              <input class="bingo-dimension-input" id="rows" type="number" bind:value={rows} min="1" max="10" on:input={generateBingo} />
            </div>
            <div class="settings-element">
              <label for="cols">Columns:</label>
              <input class="bingo-dimension-input" id="cols" type="number" bind:value={cols} min="1" max="10" on:input={generateBingo} />
            </div>
          </div>
          <div class="settings-box flex-column-item">
            <h3>Display</h3>
            <div class="settings-element">
              <button on:click={toggleTheme}>Toggle Dark/Light Mode</button>
            </div>
          </div>
          <div class="settings-box flex-column-item">
            <h3>Reset</h3>
            <div class="settings-element">
              <button on:click={deleteAllCookies}>Reset and delete Cookies</button>
            </div>
          </div>
        </div>
      </div>
      <br>
      <button id="close-settings" class="close-btn">Save and Close</button>
    </div>
  </div>
</div>

<Footer />

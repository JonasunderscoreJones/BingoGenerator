<script>
    import { onMount, afterUpdate } from 'svelte';
    import html2canvas from 'html2canvas';
    import jsPDF from 'jspdf';
    import { page } from '$app/stores';
    import party from "party-js";

    $: queryParams = $page.url.searchParams;
    $: bingocode = queryParams.get('bingo');

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

    function openAlert() {
      alertBackground.style.display = 'flex';
    }

    function closeAlert() {
      alertBackground.style.display = 'none';
    }

    // Function to add an empty cookie called gameLock
    export function addGameLockCookie() {
      document.cookie = `gameLock=;path=/;max-age=31536000`; // Cookie lasts for 1 year
    }

    // Function to check if the gameLock cookie is present
    export function isGameLockCookiePresent() {
      return document.cookie.split('; ').some(cookie => cookie.startsWith('gameLock='));
    }

    // Function to delete the gameLock cookie
    export function deleteGameLockCookie() {
      document.cookie = `gameLock=;path=/;max-age=0`;
    }


    // Function to save a string as a cookie
    export function saveEntriesAsCookie(entries, cookieName = 'bingoEntries') {
      document.cookie = `${cookieName}=${encodeURIComponent(entries)};path=/;max-age=31536000`; // Cookie lasts for 1 year
    }

    // Function to retrieve a string from a cookie
    export function getEntriesFromCookie(cookieName = 'bingoEntries') {
      const cookies = document.cookie.split('; ');
      for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
          return decodeURIComponent(value);
        }
      }
      return null; // Return null if the cookie is not found
    }

    export function deleteSavedEntriesCookie(cookieName = 'bingoEntries') {
      document.cookie = `${cookieName}=;path=/;max-age=0`;
    }

    // Function to save the nested list as a cookie
    export function saveGridAsCookie(grid, cookieName = 'bingoGrid') {
      const jsonString = JSON.stringify(grid);
      document.cookie = `${cookieName}=${encodeURIComponent(jsonString)};path=/;max-age=31536000`; // Cookie lasts for 1 year
    }

    // Function to retrieve the nested list from a cookie
    export function getGridFromCookie(cookieName = 'bingoGrid') {
      const cookies = document.cookie.split('; ');
      for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
          try {
            console.log(JSON.parse(decodeURIComponent(value)))
            return JSON.parse(decodeURIComponent(value));
          } catch (error) {
            console.error('Error parsing grid from cookie:', error);
            return null;
          }
        }
      }
      return null; // Return null if the cookie is not found
    }

    export function deleteSavedGridCookie(cookieName = 'bingoGrid') {
      document.cookie = `${cookieName}=;path=/;max-age=0`;
      deleteGameLockCookie();
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
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
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

    onMount(() => {
      const savedGrid = getGridFromCookie();
      const savedEntries = getEntriesFromCookie();

      closeAlertButton = document.getElementById('close-alert');
      alertBackground = document.getElementById('alert-background');
      closeAlertButton.addEventListener('click', closeAlert);

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

  <style>
    .bingo-grid-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 20px;
      padding: 20px;
      border: 2px solid #333;
      border-radius: 8px;
      background-color: #f4f4f9;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .bingo-grid {
      display: grid;
      gap: 6px;
      margin-bottom: 20px;
    }

    .bingo-cell {
      border: 1px solid #333;
      width: 150px; /* Bigger size */
      height: 150px; /* Bigger size */
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 18px; /* Base font size */
      background-color: #fff;
      border-radius: 4px;
      overflow: hidden;
      word-wrap: break-word;
      cursor: pointer;
    }

    .bingo-cell.clicked {
      background-color: #add8e6; /* Highlight color for clicked state */
    }

    button {
      margin-bottom: 30px;
      padding: 10px 20px;
      border: none;
      background-color: #007bff;
      color: #fff;
      cursor: pointer;
      border-radius: 4px;
      font-size: 1em;
    }

    button:hover {
      background-color: #0056b3;
    }

    .bingo-running-warning {
      /* Add your styles as needed */
      padding: 1rem;
      margin: 20px;
      background-color: #f9f9f9;
      border: 5px solid orange;
      border-radius: 10px;
      /* center text and buttons */
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .alert-background {
      display: none; /* Hidden by default */
      position: fixed; /* Fixed position */
      top: 0;
      left: 0;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      background-color: rgba(0, 0, 0, 0.7); /* Dark background */
      justify-content: center; /* Center the alert content */
      align-items: center; /* Center the alert content */
      z-index: 1000; /* Keep it on top */
    }

    .alert-content {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      width: 300px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  </style>

  <div class="bingo-grid-container">
    <h1>Randomized Bingo Generator</h1>
    <div style="margin-bottom: 10px;">
        <label for="rows">Rows:</label>
        <input id="rows" type="number" bind:value={rows} min="1" max="10" style="width: 50px; margin-right: 10px;" on:input={generateBingo} />

        <label for="cols">Columns:</label>
        <input id="cols" type="number" bind:value={cols} min="1" max="10" style="width: 50px;" on:input={generateBingo} />
    </div>
    <p>Enter your items below and click the button to generate a random 5x5 bingo grid.</p>
    <textarea bind:value={inputText} placeholder="Enter items line by line" style="width: 80%; height: 300px; margin-bottom: 10px;" on:input={generateBingo}></textarea>
    <p>NOTE: If there are more lines than Bingo cells, not all Items will be in the Bingo. The selection is still randomized.</p>
    <button on:click={downloadPDF}>Download as PDF</button>
    <button on:click={generateBingo}>Regenerate Bingo</button>

    {#if running_bingo && tried_to_regen}
      <div class="bingo-running-warning">
        <p>You are currently playing this game of Bingo and it therefore doesn't Refresh changes or Regenerate the table. If you would like to End the Game, Click the Button below.</p>
        <button style="background-color: darkred;" on:click={resetBingo}>Stop Bingo and Regenerate</button>
      </div>
    {/if}
    {#if running_bingo && !tried_to_regen}
      <i style="margin-bottom: 10px;">A game is currently running. Changes made to the configuration are not being updated to the grid.</i>
    {/if}

    {#if grid.length > 0}
    <div class="bingo-grid" style="grid-template-columns: repeat({cols}, 1fr);">
      {#each grid as row}
        {#each row as cell}
          <div
            class="bingo-cell"
            on:click={() => {cell.clicked = !cell.clicked; cellClicked();}}
            class:clicked={cell.clicked}
          >
            {cell.value}
          </div>
        {/each}
      {/each}
    </div>
    {/if}
    <p>Notice: This Website uses functional Cookies to store the Running Bingo Game as well as the Entered Bingo Entries.</p>
  </div>


  <div id="alert-background" class="alert-background">
    <div class="alert-content">
      <h2>Bingo!</h2>
      <p>You achieved a new Bingo!<br>You now have <b>{bingoCount}</b> Bingos.</p>
      <button id="close-alert" class="close-btn">Close</button>
    </div>
  </div>

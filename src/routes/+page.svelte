<script>
    import { onMount, afterUpdate } from 'svelte';
    import html2canvas from 'html2canvas';
    import jsPDF from 'jspdf';

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

    function generateBingo() {
      const inputLines = inputText.split('\n').map(line => line.trim()).filter(Boolean);
      grid = Array(rows * cols).fill('');
      const shuffledLines = [...inputLines].sort(() => Math.random() - 0.5);
      shuffledLines.forEach((line, index) => {
        if (index < grid.length) {
          grid[index] = line;
        }
      });
      grid = Array.from({ length: rows }, (_, rowIndex) =>
        grid.slice(rowIndex * cols, rowIndex * cols + cols)
      );
      console.log(grid);
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

    onMount(() => {
      generateBingo();
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
  </style>

  <div class="bingo-grid-container">
    <h1>Randomized 5x5 Bingo Generator</h1>
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

    {#if grid.length > 0}
      <div class="bingo-grid" style="grid-template-columns: repeat({cols}, 1fr);">
        {#each grid as row}
          {#each row as cell}
            <div class="bingo-cell">{cell}</div>
          {/each}
        {/each}
      </div>
    {/if}
  </div>

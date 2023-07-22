const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set the canvas size to match the window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let isDrawing = false;
    let color = '#000';
    let size = 5;
    let startX, startY;
    let tool = 'pencil';
    let drawingHistory = []; // Array to store drawing history
    let redoHistory = []; // Array to store redo history

    function draw(e) {
      if (!isDrawing) return;

      ctx.strokeStyle = color;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = size;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      startX = e.clientX;
      startY = e.clientY;
    }

    function selectTool(selectedTool) {
      tool = selectedTool;
      if (selectedTool === 'eraser') {
        color = '#f9f9f9'; // Set eraser color to match the background
      } else {
        color = document.getElementById('colorPicker').value;
      }

      // Reset the style of all buttons
      document.getElementById('pencilBtn').style.backgroundColor = 'transparent';
      document.getElementById('brushBtn').style.backgroundColor = 'transparent';
      document.getElementById('highlighterBtn').style.backgroundColor = 'transparent';
      document.getElementById('watercolorBtn').style.backgroundColor = 'transparent';
      document.getElementById('chalkBtn').style.backgroundColor = 'transparent';
      document.getElementById('eraserBtn').style.backgroundColor = 'transparent';

      // Highlight the selected tool button
      document.getElementById(selectedTool + 'Btn').style.backgroundColor = '#f9f9f9';

      closeBrushPopup();
    }

    function updateColor() {
      color = document.getElementById('colorPicker').value;
    }

    function setLineDash() {
      ctx.setLineDash([]);
    }

    function setToolStyle() {
      if (tool === 'highlighter') {
        ctx.globalAlpha = 0.3; // Set transparency for highlighter effect
        ctx.lineCap = 'round';
        ctx.setLineDash([]);
      } else if (tool === 'watercolor') {
        ctx.globalAlpha = 0.5; // Set transparency for watercolor effect
        ctx.lineCap = 'round';
        ctx.setLineDash([5, 5]);
      } else if (tool === 'chalk') {
        ctx.globalAlpha = 1; // Reset transparency for chalk effect
        ctx.lineCap = 'round';
        ctx.setLineDash([]);
      } else {
        ctx.globalAlpha = 1; // Reset transparency for other tools
        ctx.lineCap = 'round';
        setLineDash();
      }
    }

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      setToolStyle();
    });

    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('mouseup', () => {
      isDrawing = false;
      // Save the drawing in the history array
      drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      // Clear the redo history
      redoHistory = [];
    });

    canvas.addEventListener('mouseout', () => isDrawing = false);

    function decreaseSize() {
      size = Math.max(1, size - 1);
    }

    function increaseSize() {
      size += 1;
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawingHistory = []; // Clear drawing history
      redoHistory = []; // Clear redo history
    }

    function saveCanvas() {
      const link = document.createElement('a');
      link.href = canvas.toDataURL(); // Save canvas as a data URL
      link.download = 'whiteboard.png'; // Download filename
      link.click();
    }

    function toggleBrushPopup() {
      const brushPopup = document.getElementById('brushPopup');
      brushPopup.style.display = brushPopup.style.display === 'block' ? 'none' : 'block';
    }

    function closeBrushPopup() {
      const brushPopup = document.getElementById('brushPopup');
      brushPopup.style.display = 'none';
    }

    function toggleEditPopup() {
      const editPopup = document.getElementById('editPopup');
      editPopup.style.display = editPopup.style.display === 'block' ? 'none' : 'block';
    }

    function undo() {
      if (drawingHistory.length > 0) {
        // Pop the last item from the history array
        const lastAction = drawingHistory.pop();
        // Add the last action to the redo history
        redoHistory.push(lastAction);
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw the previous state from the history array
        if (drawingHistory.length > 0) {
          ctx.putImageData(drawingHistory[drawingHistory.length - 1], 0, 0);
        }
      }
    }

    function redo() {
      if (redoHistory.length > 0) {
        // Pop the last item from the redo history array
        const lastRedoAction = redoHistory.pop();
        // Add the last redo action back to the drawing history
        drawingHistory.push(lastRedoAction);
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw the last redo action on the canvas
        ctx.putImageData(lastRedoAction, 0, 0);
      }
    }
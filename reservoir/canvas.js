

const canvas = document.getElementById('canvas');

canvas.width = 600;
canvas.height = 600;

const context = canvas.getContext("2d");

canvas.style.border = '2px solid #2d2d2d';

const waterFlowImg = new Image();
const waterStillImg = new Image();
const waterSourceImg = new Image();
waterFlowImg.src = 'water-flow.png';
waterStillImg.src = 'water-stationary.png';
waterSourceImg.src = 'source.jpeg';

const drawScan = () => {
    // context.clearRect(0, 0, canvas.width, canvas.height);

    const cellWidth =  canvas.width / scan.length;
    const cellHeight = canvas.height / scan[0].length;
    const borderW = 0.02 * cellWidth;
    const borderH = 0.02 * cellHeight;

    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
        
    scan.forEach((row, x)=> {
        row.forEach((yVal, y) => {
            if(yVal === FLOW) {
                context.drawImage(waterFlowImg, 
                    x*cellWidth + borderW, 
                    y*cellHeight + borderH,
                    (cellWidth - 2* borderW), (cellHeight - 2*borderH));
            } else if(yVal === SETTLED) {
                context.drawImage(waterStillImg, 
                    x*cellWidth + borderW, 
                    y*cellHeight + borderH,
                    (cellWidth - 2* borderW), (cellHeight - 2*borderH));
            } else if(yVal === CLAY) {
                context.fillStyle = 'rgb(162, 126, 29)';
                context.fillRect(
                    x*cellWidth + borderW, 
                    y*cellHeight + borderH,
                    (cellWidth - 2* borderW), (cellHeight - 2*borderH));
            } else if(yVal === SAND){
                context.fillStyle = 'rgb(241, 209, 2)';
                context.fillRect(
                    x*cellWidth + borderW, 
                    y*cellHeight + borderH,
                    (cellWidth - 2* borderW), (cellHeight - 2*borderH));
            } else if(yVal === SPRING) {
                context.drawImage(waterSourceImg, 
                    x*cellWidth + borderW, 
                    y*cellHeight + borderH,
                    (cellWidth - 2* borderW), (cellHeight - 2*borderH));
            }
        })
    })
    
}
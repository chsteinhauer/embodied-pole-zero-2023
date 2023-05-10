import { H, H_OUT, R, State, W, W_OUT } from "./state";

let capture;
let fw, fh, cx, cy, wb, hb;

function _setup(_capture) {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas")
    
    capture = _capture;

    _windowResized();

    background(25);
    ellipseMode(CENTER);
    noFill();
}

function _draw() {
    background(25);

    push();
    scale(-1, 1);
    translate((width / 2) - (W / 2), (height / 2) - (H / 2));

    drawImage();
    drawGraph();
    drawLandmarks();

    pop();

    drawNumbers();
    drawSpectrum();
}

function _windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    fw = (width - W)/2;
    fh = (height - H)/2;

    // x axis is reversed to make image mirror movements
    cx = -(width/2 + fw);
    cy = height/2 - fh;

    wb = (width - W) / 2;
    hb = (height - H) / 2;
}


function drawImage() {
    push();
    tint(255, 126);
    image(capture, -width, 0);
    pop();
}

function drawGraph() {
    push();
    stroke(255);
    strokeWeight(1);

    ellipse(cx, cy, R*2);

    const px = cx - (W/2);
    const py = cy - (H/2);

    line(px,cy,px+W,cy);
    line(cx,py,cx,py+H);

    pop();
}

function drawLandmarks() {
    push();
    strokeWeight(2);
    const pr = 5;

    // Pole drawn as blue X
    for (const pole of State.poles) {
        stroke("#FF0000");

        const { x, y, z } = pole;
        const px = map(W*x, 0, width, -width, 0);
        const py = H*y;

        line(px-pr,py-pr,px+pr,py+pr);
        line(px-pr,py+pr,px+pr,py-pr);
    }

    // Zero drawn as red O
    for (const zero of State.zeros) {
        stroke("#0000FF");

        const { x, y, z } = zero;
        const px = map(W*x, 0, width, -width, 0);
        const py = H*y;

        ellipse(px, py, pr*2);
    }
    pop();
}

function drawNumbers() {
    push();
    stroke(255);
    if (State.mappedPoles.length) {
        const { x, y } = State.mappedPoles[0];
        text("Pole: " + x.toFixed(4) + " + " + y.toFixed(4) + "j" , wb, hb);
    }

    if (State.mappedZeros.length) {
        const { x, y } = State.mappedZeros[0];
        text("Zero: " + x.toFixed(4) + " + " + y.toFixed(4) + "j" , wb, hb-15);
    }
    pop();
}

function drawSpectrum() {
    if (!State.analyser) return;
    const data = State.buffer;
    State.analyser.getByteFrequencyData(data);

    push();
    fill(240, 75);
    noStroke();
    translate(0, height - hb*2);
    for (let i = 0; i < data.length; i++) {
        const x = map(i, 0, data.length, 0, width);
        const h = map(data[i], 0, 255, 0, -hb*2);
        push();
        rect(x, hb*2, width / data.length, h);
        pop();
    }
    pop();
}


// function drawResponse() {
//     if (!State.res) return;
//     const data = State.res;
    
//     push();
//     stroke(100, 100, 255);
//     translate(10, height/2);
//     beginShape();
//     for (let i = 0; i < data.length; i++) {
//         const x = map(i, 0, data.length, 0, 200);
//         const h = data[i];//-120 + map(data[i], 0, 255, 120, 0);
//         vertex(x, h);
//     }
//     endShape();
//     pop();
// }


export { _setup, _draw, _windowResized }

var audioCtx;
var osc;
var timings;
var liveCodeState = [];
const playButton = document.querySelector('button');

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)
    osc = audioCtx.createOscillator();
    timings = audioCtx.createGain();
    timings.gain.value = 0;
    osc.connect(timings).connect(audioCtx.destination);
    osc.start();
    scheduleAudio()
}

function scheduleAudio() {
    let timeElapsedSecs = 0;
    liveCodeState.forEach(noteData => {
        timings.gain.setTargetAtTime(1, audioCtx.currentTime + timeElapsedSecs, 0.01)
        osc.frequency.setTargetAtTime(noteData["pitch"], audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += noteData["length"]/10.0;
        timings.gain.setTargetAtTime(0, audioCtx.currentTime + timeElapsedSecs, 0.01)
        timeElapsedSecs += 0.2; //rest between notes
    });
    setTimeout(scheduleAudio, timeElapsedSecs * 1000);
}


    //allows for a repeat operation 
    //(e.g. "3@340 2[1@220 2@330]"" plays as "3@340 1@220 2@330 1@220 2@330")
function repeatItems(string) {
    const segments = string.split(/(\d+\[|\])/);
    let result = "";

    const isMultiplier = new RegExp('\\d+\\[');
    let isInMultiplier = false;
    let multiplier = 1;
    let multiplierSegment = [];

    for (const segment of segments) {
        console.log(segment);
        if (isMultiplier.test(segment)) {
            isInMultiplier = true;
            multiplier = parseInt(segment.split('[')[0]);
        }
        else if (segment == ']') {
            for (let i = 1; i <= multiplier; i++) {
                result = result += multiplierSegment + " ";
            }
            multiplierSegment = [];
            isInMultiplier = false;
        }
        else if (isInMultiplier) {
            multiplierSegment.push(segment)
        }
        else {
            result += (segment);
        }
    }

    return result;
}



function parseCode(code) {
    let repeatedItems = repeatItems(code);
    console.log(repeatedItems);
    let notes = repeatedItems.split(" ").filter(item => item !== "");
    console.log(notes)

    notes = notes.map(note => {
        noteData = note.split("@");
        return   {"length" : eval(noteData[0]), //the 'eval' function allows us to write js code in our live coding language
                "pitch" : eval(noteData[1])};
            
    });
    return notes;
}

function genAudio(data) {
    liveCodeState = data;
}

function reevaluate() {
    var code = document.getElementById('code').value;
    var data = parseCode(code);
    genAudio(data);
}

playButton.addEventListener('click', function () {

    if (!audioCtx) {
        initAudio();
    }

    reevaluate();


});

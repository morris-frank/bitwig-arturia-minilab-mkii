loadAPI(10);

host.setShouldFailOnDeprecatedUse(true);
host.defineController("Arturia", "MiniLab mkII", "0.1", "4d871b46-0439-475e-a6f3-ee4f18658033", "morris-frank");
host.defineMidiPorts(1, 1);

if (host.platformIsWindows())
	host.addDeviceNameBasedDiscoveryPair(["Arturia MiniLab mkII"], ["Arturia MiniLab mkII"]);
else if (host.platformIsMac())
	host.addDeviceNameBasedDiscoveryPair(["Arturia MiniLab mkII"], ["Arturia MiniLab mkII"]);
else if (host.platformIsLinux())
	host.addDeviceNameBasedDiscoveryPair(["Arturia MiniLab mkII MIDI 1"], ["Arturia MiniLab mkII MIDI 1"]);

var KNOB_1_CLCK = 113;
var KNOB_9_CLICK = 115;

var KNOBS_LEFT = [112, 74, 71, 76, 114, 18, 19, 16];
var KNOBS_RIGHT = [77, 93, 73, 75, 17, 91, 79, 72];

var KNOBS = KNOBS_LEFT.concat(KNOBS_RIGHT);

var PAD_ON = false

var COLOR =
{
    BLACK   :"00",
    RED     :"01",
    BLUE    :"10",
    GREEN   :"04",
    CYAN    :"14",
    PURPLE  :"11",
    YELLOW  :"05",
    WHITE   :"7F"
};

var PAD_ON_COLORS =
[
   COLOR.RED,
   COLOR.YELLOW,
   COLOR.YELLOW,
   COLOR.GREEN,
   COLOR.CYAN,
   COLOR.CYAN,
   COLOR.BLUE,
   COLOR.PURPLE
];

function init() {
   transport = host.createTransport();

   var midiPort = host.getMidiInPort(0);
   midiPort.setMidiCallback(onMidi);
   midiPort.setSysexCallback(onSysex);

   MiniLabKeys = midiPort.createNoteInput("MiniLab Keys", "80????", "90????", "B001??", "B002??", "B007??", "B00B??", "B040??", "C0????", "D0????", "E0????");
   MiniLabKeys.setShouldConsumeEvents(false);

   // MiniLabPads = midiPort.createNoteInput("MiniLab Pads", "?9????");
   // MiniLabPads.setShouldConsumeEvents(true);
   // MiniLabPads.assignPolyphonicAftertouchToExpression(0, NoteExpression.TIMBRE_UP, 2);
   // MiniLabPads.setKeyTranslationTable(emptyMap);

   cTrack = host.createCursorTrack(3, 0);
   deviceCursor = cTrack.createCursorDevice();
   controlPageCursor = deviceCursor.createCursorRemoteControlsPage(8);

   setupFuncPad(false);


   uControl = host.createUserControls(8);
   for (var i = 0; i < 8; i++)
   {
      uControl.getControl(i).setLabel("CC " + KNOBS_RIGHT[i])
      controlPageCursor.getParameter(i).setIndication(true);
      uControl.getControl(i).setIndication(true);
   }

   println("> init finished");
}

function onMidi(status, key, value) {
   // printMidi(status, key, value);
   if (isChannelController(status)) {
      if (key == 1) {
         println('IS MODWHEEL');
      } else if (key >= 22 && key <= 29 && value == 127) {
         printMidi(status, key, value);
         onFuncPad(value);
      } else {
         onWhiteKnobs(key, value)
      }
   } else {
      printMidi(status, key, value);
   }
}

function onWhiteKnobs(key, value) {
   var knob = KNOBS.indexOf(key);

   if (knob > 7){
      knob -= 8;
      controlPageCursor.getParameter(knob).setImmediately(value / 128);
   } else if (knob == 0) {
      if (value > 64) {
         controlPageCursor.selectNextPage(true);
      } else if (value < 64){
         controlPageCursor.selectPreviousPage(true);
      }
   } else if (knob == 4) {
      println('Bottom ' + knob + ': ' + value);
   } else if (knob >= 0) {
      println('RIGHT ' + knob + ': ' + value);
   } else {
   }
}

function onFuncPad(value) {
   println('IS PAD');
}

function setupFuncPad(active) {
   if (active) {
      println('MAKE RAINBOW');
      for (let i = 0; i < 8; i++) {
         setPadColor(i, PAD_ON_COLORS[i]);
      }
      PAD_ON = true;
   } else {
      for (var i = 0; i < 8; i++){
         setPadColor(i, COLOR.WHITE);
      }
      PAD_ON = false;
   }

}

function setPadColor(pad, color) {
    var padHex = (112 + pad).toString(16);
    sendSysex("F0 00 20 6B 7F 42 02 00 10 " + padHex + " " + color + " F7");
}

function onSysex(data) {
   println(data);
   switch (data) {
      case "f000206b7f420200002f00f7":
         setupFuncPad(!PAD_ON);
   }
}

function flush() {
}


function resetRemoteControl()
{
    for (var i = 0; i < 8; i++)
    {
        controlPageCursor.getParameter(i).reset();
    }
}


function exit() {
   println("> exit");
}

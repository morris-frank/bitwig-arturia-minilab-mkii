loadAPI(10);

host.setShouldFailOnDeprecatedUse(true);
host.defineController("Arturia", "MiniLab mkII", "0.1", "4d871b46-0439-475e-a6f3-ee4f18658033", "morris-frank");
host.defineMidiPorts(1, 1);

host.addDeviceNameBasedDiscoveryPair(["Arturia MiniLab mkII MIDI 1"], ["Arturia MiniLab mkII MIDI 1"]);

var STATUS_KNOB = 176;

var KNOB_1_CLCK = 113;
var KNOB_9_CLICK = 115;

var KNOBS_LEFT = [112, 74, 71, 76, 114, 18, 19, 16];
var KNOBS_RIGHT = [77, 93, 73, 75, 17, 91, 79, 72];

var KNOBS = KNOBS_LEFT.concat(KNOBS_RIGHT);

function init() {
   transport = host.createTransport();

   var midiPort = host.getMidiInPort(0);
   midiPort.setMidiCallback(onMidi);
   midiPort.setSysexCallback(onSysex0);

   cTrack = host.createCursorTrack(3, 0);
   deviceCursor = cTrack.createCursorDevice();
   controlPageCursor = deviceCursor.createCursorRemoteControlsPage(8);

   uControl = host.createUserControls(8);
   for (var i = 0; i < 8; i++)
   {
       uControl.getControl(i).setLabel("CC " + KNOBS_RIGHT[i])
   }

   println("> init finished");
}

// Called when a short MIDI message is received on MIDI input port 0.
function onMidi(status, key, value) {
   if (status == STATUS_KNOB) {
      var knob = KNOBS.indexOf(key);

      if (knob > 7){
         knob -= 8;
         controlPageCursor.getParameter(knob).setImmediately(value / 128);
         println('L ' + knob + ': ' + value);
      } else if (knob >= 0) {
         println('RIGHT ' + knob + ': ' + value);
      } else {
         if (key == KNOB_9_CLICK) {
            resetRemoteControl();
         }
      }
   }
}

// Called when a MIDI sysex message is received on MIDI input port 0.
function onSysex0(data) {
   // MMC Transport Controls:
   switch (data) {
      case "f07f7f0605f7":
         transport.rewind();
         break;
      case "f07f7f0604f7":
         transport.fastForward();
         break;
      case "f07f7f0601f7":
         transport.stop();
         break;
      case "f07f7f0602f7":
         transport.play();
         break;
      case "f07f7f0606f7":
         transport.record();
         break;
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

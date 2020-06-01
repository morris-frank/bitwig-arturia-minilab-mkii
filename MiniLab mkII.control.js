loadAPI(10);

host.setShouldFailOnDeprecatedUse(true);
host.defineController("Arturia", "MiniLab mkII", "0.1", "4d871b46-0439-475e-a6f3-ee4f18658033", "morris-frank");
host.defineMidiPorts(1, 1);

host.addDeviceNameBasedDiscoveryPair(["Arturia MiniLab mkII MIDI 1"], ["Arturia MiniLab mkII MIDI 1"]);

function init() {
   transport = host.createTransport();

   var midiPort = host.getMidiInPort(0);
   midiPort.setMidiCallback(onMidi0);
   midiPort.setSysexCallback(onSysex0);

   println("> init finished");
}

// Called when a short MIDI message is received on MIDI input port 0.
function onMidi0(status, data1, data2) {
   printMidi(status, data1, data2);
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

function exit() {
   println("> exit");
}

/* =====================================================================
   SITE CONTENT — this is the only file you need to edit to update the site.

   Quick guide
   - Tick off a phase task:     change  done: false  to  done: true
   - Mark a part as bought:     change  status: "needed"  to "ordered" or "arrived"
   - Change what a part cost:   edit  price  (pounds, a number)
   - Post an update:            add an entry to the TOP of  updates
   - Add a photo:               put it in assets/img/photos/ and add it to  gallery
   - Move to the next phase:    set the old phase's status to "done"
                                and the new one's to "active"

   Phase status values:  "done" | "active" | "planned"
   Part status values:   "needed" | "ordered" | "arrived"
   ===================================================================== */

window.SITE = {
  config: {
    title: "Matthew's Drone Build",
    shortTitle: "Drone Build",
    owner: "Matthew",
    tagline: "A 5-inch quadcopter with a 3D-printed frame, a flight controller I'm designing myself and flight code I'm writing from scratch.",
    budget: 300,              // total budget in £
    lastUpdated: "2026-11-23",
    githubUrl: "",            // e.g. "https://github.com/yourname/drone-build" (leave "" to hide)
    siteUrl: "",              // e.g. "yourname.github.io/drone-build" (shown at the end of the presentation)
    goalDate: "2027-03-28",   // target date for the first stable 2-minute hover
  },

  goal: {
    headline: "Two minutes of stable, self-levelling flight.",
    points: [
      { title: "Printed frame", text: "Arms, plates and mounts printed on my Bambu Lab A1 in PLA Tough+ and PETG." },
      { title: "My own circuit board", text: "A flight controller PCB I design myself, with the sensors, radio, logging and power on one board." },
      { title: "My own code", text: "C++ for the 1 kHz flight loop, MicroPython for testing, and a Python ground station on my Mac." },
      { title: "Two ways to fly", text: "Live control from a laptop and gamepad, or a pre-programmed mission that flies itself." },
    ],
  },

  specs: [
    { label: "Size", value: "5-inch X quad" },
    { label: "All-up weight", value: "about 500–550 g" },
    { label: "Brain", value: "RP2350 (Pico 2)" },
    { label: "Control loop", value: "1 kHz" },
    { label: "Motors", value: "Emax ECO II 2207, 1900 KV" },
    { label: "Battery", value: "4S 1300 mAh LiPo" },
    { label: "Radio", value: "nRF24L01+ at 2.4 GHz" },
    { label: "Ceiling", value: "120 m (the legal limit)" },
  ],

  /* ---------------- Phases ---------------- */
  phases: [
    {
      id: "groundwork",
      name: "Groundwork",
      start: "2026-11-16", end: "2026-11-29",
      status: "active",
      summary: "Sort out the boring but essential things: where to fly, the club membership, and the first parts order.",
      tasks: [
        { text: "Join FPV UK", done: false },
        { text: "Agree a flying site", done: false },
        { text: "Order the bench electronics (batch 1)", done: false },
        { text: "Get MicroPython running on the Pico 2", done: false },
      ],
    },
    {
      id: "bench",
      name: "Electronics on the bench",
      start: "2026-11-23", end: "2027-01-10",
      status: "planned",
      summary: "Wire the sensors, radio and SD card on a breadboard, and see live data on the Mac.",
      tasks: [
        { text: "Live tilt angle graphed on the Mac", done: false },
        { text: "Gamepad command arrives over the radio", done: false },
        { text: "Log file written to the SD card", done: false },
        { text: "Every motor spins from my own PWM (props off, through the smoke stopper)", done: false },
      ],
    },
    {
      id: "frame",
      name: "Frame design and prints",
      start: "2026-12-07", end: "2027-01-24",
      status: "planned",
      summary: "Design the frame in CAD and print it. It has to be stiff and survive crashes.",
      tasks: [
        { text: "Frame survives a 1 m drop onto grass", done: false },
        { text: "No arm flex when twisted by hand", done: false },
      ],
    },
    {
      id: "firmware",
      name: "Flight firmware",
      start: "2027-01-04", end: "2027-02-21",
      status: "planned",
      summary: "Port the tested pieces to C++ and build the real flight loop, arming and failsafes.",
      tasks: [
        { text: "C++ loop holds 1 kHz on core 0", done: false },
        { text: "Motors react correctly when I tilt the frame by hand (props off)", done: false },
        { text: "Arming and every failsafe tested", done: false },
      ],
    },
    {
      id: "rig",
      name: "Test-rig tuning",
      start: "2027-02-08", end: "2027-03-14",
      status: "planned",
      summary: "Tune the PID controller with the drone held in a gimbal so it can tilt but can't fly away.",
      tasks: [
        { text: "Holds level on the gimbal without wobbling", done: false },
        { text: "Recovers from a 20° push", done: false },
      ],
    },
    {
      id: "flights",
      name: "First flights",
      start: "2027-03-08", end: "2027-03-28",
      status: "planned",
      milestone: "2-minute hover",
      summary: "Low hovers over grass at the flying site with my supervisor on the kill switch.",
      tasks: [
        { text: "Hover at 0.5–1 m", done: false },
        { text: "Two minutes of stable flight", done: false },
      ],
    },
    {
      id: "pcb",
      name: "Custom PCB",
      start: "2027-02-15", end: "2027-05-02",
      status: "planned",
      summary: "Design my own flight controller board, get it made, and fly the same hover on it.",
      tasks: [
        { text: "Schematic checked pin for pin against the breadboard", done: false },
        { text: "Boards ordered from JLCPCB", done: false },
        { text: "The same 2-minute hover, on my own board", done: false },
      ],
    },
    {
      id: "altitude",
      name: "Altitude hold and missions",
      start: "2027-05-03", end: "2027-07-04",
      status: "planned",
      summary: "Hold a set height, fly scripted missions, and climb in steps towards 120 m.",
      tasks: [
        { text: "Holds height to ±0.3 m", done: false },
        { text: "Scripted take-off, hover and land", done: false },
        { text: "Auto-lands when the radio link is lost", done: false },
        { text: "Climb in steps towards 120 m", done: false },
      ],
    },
  ],

  /* ---------------- Shopping list ----------------
     price = approximate total for that line in £ (qty included).
     optional: true  → not counted towards the main budget total. */
  batches: [
    {
      id: "b1",
      name: "Bench electronics",
      when: "Order now (Phase 1)",
      about: "Everything to start testing sensors, radio and logging on a breadboard.",
      items: [
        { name: "Raspberry Pi Pico 2 with headers", part: "SC1632", qty: 2, price: 11, status: "needed",
          note: "One for the drone, one as the radio bridge on the Mac side. Must be Pico 2 (RP2350).",
          links: [
            { label: "Amazon", url: "https://www.amazon.co.uk/s?k=Raspberry+Pi+Pico+2+with+headers+SC1632" },
            { label: "Rapid Online", url: "https://www.rapidonline.com/raspberry-pi-sc1632-pico-2-microcontroller-board-with-headers-11-5238" },
          ] },
        { name: "Adafruit LSM6DSOX 6-DoF IMU", part: "ADA4438", qty: 1, price: 9.5, status: "needed",
          note: "Gyro and accelerometer. Wired over SPI for the 1 kHz loop.",
          links: [
            { label: "Pimoroni", url: "https://shop.pimoroni.com/products/adafruit-lsm6dsox-6-dof-accelerometer-and-gyroscope-stemma-qt-qwiic" },
            { label: "The Pi Hut", url: "https://thepihut.com/collections/all/products/adafruit-lsm6dsox-6-dof-accelerometer-and-gyroscope" },
            { label: "Amazon", url: "https://www.amazon.co.uk/s?k=Adafruit+LSM6DSOX+6+DoF" },
          ] },
        { name: "nRF24L01+ PA/LNA radio pair with adapters", part: "nRF24L01+", qty: 2, price: 10, status: "needed",
          note: "One on the drone, one on the ground. The adapter boards have their own 3.3 V regulator.",
          links: [ { label: "Amazon", url: "https://www.amazon.co.uk/s?k=NRF24L01%2BPA%2BLNA+2+pack+breakout+adapter+antenna" } ] },
        { name: "Micro SD card module (SPI)", qty: 1, price: 2, status: "needed",
          note: "Runs from 5 V, so it's powered from the Pico's VBUS pin.",
          links: [
            { label: "Kunkune", url: "https://kunkune.co.uk/shop/arduino-sensors/micro-sd-card-module-for-arduino/" },
            { label: "Amazon", url: "https://www.amazon.co.uk/s?k=micro+SD+card+module+SPI+level+conversion+Arduino" },
          ] },
        { name: "microSD card, 16 or 32 GB", qty: 1, price: 6, status: "needed",
          note: "Formatted FAT32 for flight logs.",
          links: [ { label: "Amazon", url: "https://www.amazon.co.uk/s?k=SanDisk+32GB+microSDHC+card" } ] },
        { name: "Breadboard kit and jumper wires", qty: 1, price: 5, status: "needed",
          note: "830-point board, with male-to-female jumpers.",
          links: [
            { label: "Kunkune", url: "https://kunkune.co.uk/shop/compatible-with-arduino-compatible-starter-kits/prototype-bread-board-kit-65-jumper-wires-breadboard-power-module/" },
            { label: "Amazon", url: "https://www.amazon.co.uk/s?k=BOJACK+breadboard+kit+830+400+170+jumper+wires" },
          ] },
        { name: "Micro-USB data cable", qty: 1, price: 4, status: "needed",
          note: "A data cable, not charge-only, or the Pico can't be programmed.",
          links: [ { label: "Amazon", url: "https://www.amazon.co.uk/s?k=micro+USB+data+cable+short" } ] },
      ],
    },
    {
      id: "b2",
      name: "Power and propulsion",
      when: "Around Christmas",
      about: "The motors, ESC, batteries and charging gear. The expensive batch.",
      items: [
        { name: "JHEMCU RuiBet 45A 4-in-1 ESC (BLHeli_S, 30.5 mm)", qty: 1, price: 38, status: "needed",
          note: "Drives all four motors. Has a current sensor; no BEC, so my board makes its own 5 V." },
        { name: "Emax ECO II 2207 1900 KV motor", qty: 4, price: 52, status: "needed",
          note: "Lower KV gives finer throttle control for smooth hovering." },
        { name: "5-inch tri-blade props (e.g. 5×4.3×3)", qty: 3, price: 8, status: "needed",
          note: "Three sets, because some will break." },
        { name: "CNHL Black Series 1300 mAh 4S LiPo", qty: 2, price: 32, status: "needed",
          note: "Two packs so one can charge while the other flies." },
        { name: "AC balance charger (ToolkitRC M6AC or ISDT 608AC)", qty: 1, price: 45, status: "needed",
          note: "Plugs straight into the wall." },
        { name: "LiPo-safe bag", qty: 1, price: 8, status: "needed", note: "Batteries are always charged inside it." },
        { name: "XT60s, silicone wire, heat shrink, standoffs, strap", qty: 1, price: 15, status: "needed", note: "" },
        { name: "Smoke stopper", qty: 1, price: 5, status: "needed",
          note: "Limits current on the first power-up of anything new, so a mistake doesn't burn the board." },
        { name: "608 skateboard bearings", qty: 4, price: 4, status: "needed", note: "For the test gimbal." },
      ],
    },
    {
      id: "b3",
      name: "Altitude sensors",
      when: "Spring (optional)",
      about: "Breakout boards to test height sensing early. Can be skipped and tested on the PCB instead.",
      items: [
        { name: "BMP390 barometer breakout", qty: 1, price: 10, status: "needed", optional: true,
          note: "Air pressure to height, about ±0.5 m." },
        { name: "VL53L1X time-of-flight breakout", qty: 1, price: 10, status: "needed", optional: true,
          note: "Laser rangefinder pointing down, accurate up to about 4 m. Used for landing." },
      ],
    },
    {
      id: "b4",
      name: "Custom PCB",
      when: "February to April",
      about: "My own flight controller, manufactured and partly assembled by JLCPCB.",
      items: [
        { name: "5 × 4-layer boards from JLCPCB, partly assembled", qty: 5, price: 35, status: "needed",
          note: "They solder the tiny IMU and barometer; I hand-solder the connectors and the Pico 2." },
      ],
    },
  ],

  alreadyHave: [
    "Bambu Lab A1 3D printer, with PLA Tough+, PLA Matte and PETG",
    "Soldering iron, multimeter and oscilloscope",
    "Safety glasses",
    "Flyer ID (my supervisor holds the Operator ID)",
  ],

  /* ---------------- Updates (newest first) ----------------
     body: an array of paragraphs.  image: optional path, e.g. "assets/img/photos/first-print.jpg" */
  updates: [
    {
      date: "2026-11-23",
      title: "This site is live",
      phase: "groundwork",
      body: [
        "I've made this site so friends and family can follow along without me explaining it all again every time. The roadmap shows where I am, and the parts list shows what I still need.",
        "Next up is the first parts order: two Pico 2 boards, a motion sensor, a pair of radios and an SD card module. That's about £45 and enough to start testing on a breadboard.",
      ],
    },
    {
      date: "2026-11-14",
      title: "The plan is done",
      phase: "groundwork",
      body: [
        "I've written up the full plan: the parts, the budget, the rules on where I'm allowed to fly, and a timeline that gets to a stable 2-minute hover by the end of March.",
        "The big decisions: a 5-inch quad of about 500 g, a printed frame, bought motors and ESC, and a Raspberry Pi Pico 2 as the brain. Later it moves onto a circuit board I design myself.",
        "One catch: a home-built drone this size isn't allowed to fly free in a garden, so early testing happens on a fixed rig, and real flights happen at a proper flying site.",
      ],
    },
  ],

  /* ---------------- Gallery ----------------
     Photos:   { src: "assets/img/photos/your-photo.jpg", caption: "...", date: "2026-12-01" }
     Drawings: { src: "assets/img/....svg", caption: "...", kind: "drawing" } */
  gallery: [
    { src: "assets/img/quad-top.svg", caption: "Top view of the planned 5-inch X frame, with the motors numbered the way the flight code numbers them.", kind: "drawing" },
    { src: "assets/img/pcb-rev-a.svg", caption: "Rev A of the flight controller: a carrier board with a Pico 2 soldered on, the IMU in the middle, and power at one edge.", kind: "drawing" },
    { src: "assets/img/stack.svg", caption: "How the electronics stack up on the frame: the ESC at the bottom, my board on top, both on rubber grommets.", kind: "drawing" },
    { src: "assets/img/test-rig.svg", caption: "The gimbal test rig. The drone can tilt freely but can't fly away while I tune it.", kind: "drawing" },
  ],
};

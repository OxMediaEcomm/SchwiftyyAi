'use strict';

// ANSI escape constants
const RESET        = '\x1b[0m';
const GREEN        = '\x1b[32m';
const BRIGHT_GREEN = '\x1b[92m';
const YELLOW       = '\x1b[33m';
const CLEAR_LINE   = '\x1b[2K\r';
const CURSOR_UP    = (n) => `\x1b[${n}A`;
const HIDE_CURSOR  = '\x1b[?25l';
const SHOW_CURSOR  = '\x1b[?25h';

// TTY / color detection
const noColor    = process.env.NO_COLOR != null || process.env.TERM === 'dumb';
const canAnimate = process.stdout.isTTY && !noColor;

// Static fallback art (always <= 40 chars per line, no ANSI)
const STATIC_ART = [
  '   SCHWIFTYY  ::  C-420         ',
  '#########*****+++++++++++++++***###*****',
  '########*******++++++++++++++**********#',
  '########*****+++++++*+=+++********######',
  '#######******++*++**=+*++***+*****#####*',
  '#######********++++*#*++++*++*****#####*',
  '#######*********+******+++**+******#####',
  '########********+*****************######',
  '##########*##*******#*+*********########',
  '#########**+++=+=++++**++++++++***######',
  '#######**++++++++++++*++++++***#######*#',
  '######**######********#**#############+*',
].join('\n');

// Opening line (word-wrapped at 40 cols)
const OPENING_LINE =
  "*burp* Oh look, another vibe coder... they just let anyone mess with this stuff now. " +
  "Good thing Dimension C-420 sent the best. I'm Schwiftyy — and yeah, I'm exactly as " +
  "good as I sound. What are we breaking today?";

// Word-wrap a string to maxWidth columns, returns array of lines
function wordWrap(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxWidth) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

// Helper: colorize a line's visible chars with a given color code (only in animate mode)
function col(color, text) {
  if (noColor) return text;
  return color + text + RESET;
}

// 16 frames — each is an array of 7 strings, max 40 chars visible per line
// Frames 1-4:  portal crack (thin vertical line)
// Frames 5-8:  portal widens to oval, swirl chars appear
// Frames 9-12: portal fully open, Schwiftyy silhouette (YELLOW) visible inside
// Frames 13-15: Schwiftyy steps forward, portal begins closing
// Frame 16:    portal closed, Schwiftyy stands in front

const RAW_FRAMES = [
  // Frame 1 — first crack
  [
    '                                        ',
    '                   |                    ',
    '                  |||                   ',
    '                   |                    ',
    '                                        ',
    '                                        ',
    '                                        ',
  ],
  // Frame 2 — crack grows
  [
    '                   |                    ',
    '                  |||                   ',
    '                 |||||                  ',
    '                  |||                   ',
    '                   |                    ',
    '                                        ',
    '                                        ',
  ],
  // Frame 3 — crack taller
  [
    '                  |||                   ',
    '                 |||||                  ',
    '                |||||||                 ',
    '                 |||||                  ',
    '                  |||                   ',
    '                   |                    ',
    '                                        ',
  ],
  // Frame 4 — crack fully tall
  [
    '                   |                    ',
    '                  |||                   ',
    '                 |||||                  ',
    '                |||||||                 ',
    '                 |||||                  ',
    '                  |||                   ',
    '                   |                    ',
  ],
  // Frame 5 — oval starts forming, inner swirl
  [
    '                  ~~~                   ',
    '                /~~~~~\\                ',
    '               |~~ @ ~~|               ',
    '                \\~~~~~/                ',
    '                  ~~~                   ',
    '                                        ',
    '                                        ',
  ],
  // Frame 6 — oval wider
  [
    '                 ~~~~~                  ',
    '               /~~~~~~~\\               ',
    '              |~~~ @ ~~~|               ',
    '              |~~~ o ~~~|               ',
    '               \\~~~~~~~/               ',
    '                 ~~~~~                  ',
    '                                        ',
  ],
  // Frame 7 — oval wider still, swirl chars rotating
  [
    '                ~~~~~~~~                ',
    '              /~~~~~~~~~~\\             ',
    '             |~~~~ ≈ ~~~~|              ',
    '             |~~~~ O ~~~~|              ',
    '             |~~~~ ≈ ~~~~|              ',
    '              \\~~~~~~~~~~/             ',
    '                ~~~~~~~~                ',
  ],
  // Frame 8 — full oval, active swirl
  [
    '               ~~~~~~~~~                ',
    '             /~~~~~~~~~~~\\             ',
    '            |~~~~~ @ ~~~~~|             ',
    '            |~~~~~ o ~~~~~|             ',
    '            |~~~~~ @ ~~~~~|             ',
    '             \\~~~~~~~~~~~/             ',
    '               ~~~~~~~~~                ',
  ],
  // Frame 9 — fully open, Schwiftyy silhouette inside
  [
    '             ~~~~~~~~~~~~               ',
    '           /~~~~~~~~~~~~~~\\            ',
    '          |~~~~~~  (~) ~~~~|            ',
    '          |~~~~~~~~~~~~~~~ |            ',
    '          |~~~~~~~~~~~~~~~~|            ',
    '           \\~~~~~~~~~~~~~~/            ',
    '             ~~~~~~~~~~~~               ',
  ],
  // Frame 10 — Schwiftyy brighter inside
  [
    '            ~~~~~~~~~~~~                ',
    '          /~~~~~~~~~~~~~~\\             ',
    '         |~~~~~~~~~~~~~~~|              ',
    '         |~~~~  (~)  ~~~~|              ',
    '         |~~~~~~~~~~~~~~~|              ',
    '          \\~~~~~~~~~~~~~/              ',
    '            ~~~~~~~~~~~~                ',
  ],
  // Frame 11 — portal bright, Schwiftyy centered
  [
    '           ~~~~~~~~~~~~~                ',
    '         /~~~~~~~~~~~~~~~\\             ',
    '        |~~~~~~~~~~~~~~~~|              ',
    '        |~~~~~ (~) ~~~~~~|              ',
    '        |~~~~~~~~~~~~~~~~|              ',
    '         \\~~~~~~~~~~~~~~~/             ',
    '           ~~~~~~~~~~~~~                ',
  ],
  // Frame 12 — Schwiftyy at portal edge
  [
    '          ~~~~~~~~~~~~~~                ',
    '        /~~~~~~~~~~~~~~~~\\             ',
    '       |~~~~~~~~~~~~~~~~~|             ',
    '       |~~~~~~~~~~~~~~~~~|             ',
    '       |~~~~~  (~)  ~~~~~~|            ',
    '        \\~~~~~~~~~~~~~~~~/             ',
    '          ~~~~~~~~~~~~~~                ',
  ],
  // Frame 13 — Schwiftyy steps out, portal starts closing
  [
    '          ~~~~~~~~~~~~~                 ',
    '        /~~~~~~~~~~~~~\\                ',
    '       |~~~~~~~~~~~~~~ |                ',
    '       |~~~~~~~~~~~~~~~|                ',
    '        \\~~~~~~~~~~~~~/                ',
    '           ~~~~~~~~~~                   ',
    '          \\  * //                      ',
  ],
  // Frame 14 — portal shrinking, leaf top emerges
  [
    '             ~~~~~~~                    ',
    '           /~~~~~~~~~\\                 ',
    '          |~~~~~~~~~~~|                 ',
    '           \\~~~~~~~~~/                 ',
    '             ~~~~~~~                    ',
    '#########*****+++++++++++++++***###*****',
    '########*******++++++++++++++**********#',
  ],
  // Frame 15 — portal nearly closed, more leaf visible
  [
    '              ~~~~~                     ',
    '            /~~~~~~~\\                  ',
    '             \\~~~~~~/                  ',
    '#########*****+++++++++++++++***###*****',
    '########*******++++++++++++++**********#',
    '########*****+++++++*+=+++********######',
    '#######******++*++**=+*++***+*****#####*',
  ],
  // Frame 16 — portal closed, Schwiftyy standing proud
  [
    '#########*****+++++++++++++++***###',
    '########*******++++++++++++++******',
    '########*****+++++++*+=+++*********',
    '#######******++*++**=+*++***+*****#',
    '#######********++++*#*++++*++*****#',
    '#######*********+******+++**+******',
    '######**######********#**##########',
  ],
];

// Colorize a frame based on frame index
function colorizeFrame(frame, index) {
  if (noColor) return frame;

  return frame.map((line) => {
    // Frames 0-3: crack — BRIGHT_GREEN on non-space chars
    if (index < 4) {
      return line.replace(/[|]/g, BRIGHT_GREEN + '$&' + RESET);
    }
    // Frames 4-7: oval forming — GREEN outer, BRIGHT_GREEN inner swirl
    if (index < 8) {
      return line
        .replace(/[/\\]/g, GREEN + '$&' + RESET)
        .replace(/[~≈@oO*·]/g, BRIGHT_GREEN + '$&' + RESET)
        .replace(/\|/g, GREEN + '$&' + RESET);
    }
    // Frames 8-11: full portal — GREEN outer, BRIGHT_GREEN swirl, YELLOW for (~)
    if (index < 12) {
      return line
        .replace(/[/\\]/g, GREEN + '$&' + RESET)
        .replace(/\|/g, GREEN + '$&' + RESET)
        .replace(/[~≈@oO*·]/g, BRIGHT_GREEN + '$&' + RESET)
        .replace(/\(~\)/g, YELLOW + '(~)' + RESET);
    }
    // Frames 12-15: closing — GREEN portal, YELLOW Schwiftyy character
    return line
      .replace(/[/\\]/g, GREEN + '$&' + RESET)
      .replace(/\|/g, GREEN + '$&' + RESET)
      .replace(/[~≈@oO·]/g, GREEN + '$&' + RESET)
      .replace(/\*\.\*\.\*|\\\s\*\s\/\/|-\*\.\*\.\*-|\(o \^ o\)/g, YELLOW + '$&' + RESET)
      .replace(/\*/g, YELLOW + '$&' + RESET);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printFrame(lines, frameIndex) {
  if (frameIndex > 0) {
    process.stdout.write(CURSOR_UP(lines.length));
  }
  for (const line of lines) {
    process.stdout.write(CLEAR_LINE + line + '\n');
  }
}

function printOpeningLine() {
  const wrapped = wordWrap(OPENING_LINE, 40);
  process.stdout.write('\n');
  for (const line of wrapped) {
    if (!canAnimate) {
      process.stdout.write(line + '\n');
    } else {
      process.stdout.write(YELLOW + line + RESET + '\n');
    }
  }
}

async function animate() {
  const frameHeight = RAW_FRAMES[0].length;
  process.stdout.write(HIDE_CURSOR);

  // Anchor cursor: print blank lines
  for (let i = 0; i < frameHeight; i++) {
    process.stdout.write('\n');
  }

  for (let i = 0; i < RAW_FRAMES.length; i++) {
    const colored = colorizeFrame(RAW_FRAMES[i], i);
    printFrame(colored, i);
    await sleep(80);
  }

  process.stdout.write(SHOW_CURSOR);
  printOpeningLine();
}

// Main
if (canAnimate) {
  animate().catch(() => {
    process.stdout.write(SHOW_CURSOR);
    console.log(STATIC_ART);
    printOpeningLine();
  });
} else {
  console.log(STATIC_ART);
  printOpeningLine();
}

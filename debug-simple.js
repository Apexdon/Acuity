// Simple Acuity Debug Script (uses window.AcuityDebug)
// Run this in console after page loads

console.clear();
console.log('%c=== ACUITY SIMPLE DEBUG ===', 'color: #00ff00; font-size: 16px; font-weight: bold');

// Access the exposed debug interface
const { appState, actions, render } = window.AcuityDebug;

console.log('\n%c[1] Testing State Access', 'color: #00aaff; font-weight: bold');
console.log('Program steps:', appState.program.length);
console.log('Program running:', appState.programRunning);
console.log('Active commands:', [...appState.activeCommands.entries()]);

console.log('\n%c[2] Manual Test - Simulate Running State', 'color: #ffaa00; font-weight: bold');
console.log('Forcing program to running state...');

// Mark all SET commands as active
appState.program.forEach((step, idx) => {
  if (step.type === 'set') {
    appState.activeCommands.set(idx, true);
  }
});

// Re-render
render.programList();

// Check button states
const stopButtons = document.querySelectorAll('[data-stop-command]');
const enabledCount = [...stopButtons].filter(b => !b.disabled).length;

console.log('Total stop buttons:', stopButtons.length);
console.log('ENABLED stop buttons:', enabledCount);
console.log('Active commands:', [...appState.activeCommands.keys()]);

if (enabledCount === 0) {
  console.error('%c❌ PROBLEM FOUND: Stop buttons are NOT enabled!', 'color: red; font-size: 14px');
  console.log('Inspecting first button...');
  if (stopButtons[0]) {
    console.log('Button HTML:', stopButtons[0].outerHTML);
    console.log('Button disabled property:', stopButtons[0].disabled);
    console.log('Button has "disabled" attribute:', stopButtons[0].hasAttribute('disabled'));
  }
} else {
  console.log('%c✅ SUCCESS: Stop buttons are enabled!', 'color: green; font-size: 14px');
}

console.log('\n%c[3] Available Commands:', 'color: #00aaff; font-weight: bold');
console.log('Run: window.AcuityDebug.actions.runProgram()');
console.log('Check state: window.AcuityDebug.appState');
console.log('Force render: window.AcuityDebug.render.programList()');

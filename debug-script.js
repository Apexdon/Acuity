// Acuity Control Board GUI - Comprehensive Debug Script
// Paste this entire script into Chrome/Edge DevTools Console (F12)
// Then follow the instructions printed

console.clear();
console.log('%c=== ACUITY DEBUG SCRIPT ===', 'color: #00ff00; font-size: 16px; font-weight: bold');
console.log('This script will test all aspects of the program execution system.\n');

// Test 1: Check if core objects exist
console.log('%c[1] Checking Core Objects...', 'color: #00aaff; font-weight: bold');
const checks = {
  appState: typeof appState !== 'undefined',
  actions: typeof actions !== 'undefined',
  render: typeof render !== 'undefined',
  serialManager: typeof serialManager !== 'undefined',
  bindEvents: typeof bindEvents !== 'undefined'
};
console.table(checks);

if (!checks.appState || !checks.actions || !checks.render) {
  console.error('❌ CRITICAL: Core objects missing! The page may not have loaded correctly.');
  console.log('Try refreshing the page and running this script again.');
} else {
  console.log('✅ All core objects exist');
}

// Test 2: Check appState structure
console.log('\n%c[2] Checking appState Structure...', 'color: #00aaff; font-weight: bold');
if (typeof appState !== 'undefined') {
  const stateCheck = {
    program: Array.isArray(appState.program),
    programRunning: typeof appState.programRunning === 'boolean',
    stopRequested: typeof appState.stopRequested === 'boolean',
    activeCommands: appState.activeCommands instanceof Map,
    programLength: appState.program?.length || 0
  };
  console.table(stateCheck);

  if (appState.program.length === 0) {
    console.warn('⚠️  WARNING: No program steps defined. Add some SET commands first!');
  } else {
    console.log('✅ Program has', appState.program.length, 'steps');
    console.log('Program contents:', appState.program);
  }
} else {
  console.error('❌ appState is undefined');
}

// Test 3: Check button elements exist
console.log('\n%c[3] Checking Button Elements...', 'color: #00aaff; font-weight: bold');
const runBtn = document.getElementById('runProgram');
const stopBtn = document.getElementById('stopProgram');
const programList = document.getElementById('programList');

console.log('Run Program button:', runBtn ? '✅ Found' : '❌ Missing');
console.log('Stop Program button:', stopBtn ? '✅ Found' : '❌ Missing');
console.log('Program List container:', programList ? '✅ Found' : '❌ Missing');

// Test 4: Check event listeners
console.log('\n%c[4] Checking Event Listeners...', 'color: #00aaff; font-weight: bold');
if (runBtn) {
  const listeners = getEventListeners(runBtn);
  console.log('Run button listeners:', listeners);
  if (listeners.click && listeners.click.length > 0) {
    console.log('✅ Run button has click listener');
  } else {
    console.error('❌ Run button has NO click listener!');
  }
}

// Test 5: Wrap actions.runProgram to monitor execution
console.log('\n%c[5] Installing Runtime Monitor...', 'color: #00aaff; font-weight: bold');
if (typeof actions !== 'undefined' && actions.runProgram) {
  window._originalRunProgram = actions.runProgram;
  actions.runProgram = async function(...args) {
    console.log('%c🚀 runProgram CALLED', 'background: #00ff00; color: black; padding: 4px');
    console.log('  Program steps:', appState.program.length);
    console.log('  Program running before:', appState.programRunning);
    console.log('  Active commands before:', [...appState.activeCommands.keys()]);

    const result = await window._originalRunProgram.apply(this, args);

    console.log('%c✅ runProgram COMPLETED', 'background: #0088ff; color: white; padding: 4px');
    console.log('  Program running after:', appState.programRunning);
    console.log('  Active commands after:', [...appState.activeCommands.keys()]);

    return result;
  };
  console.log('✅ Runtime monitor installed on actions.runProgram');
} else {
  console.error('❌ Cannot install monitor: actions.runProgram not found');
}

// Test 6: Wrap render.programList to monitor renders
if (typeof render !== 'undefined' && render.programList) {
  window._originalRenderProgramList = render.programList;
  render.programList = function(...args) {
    console.log('%c🎨 render.programList CALLED', 'background: #ff9900; color: black; padding: 4px');
    console.log('  Active commands:', [...appState.activeCommands.entries()]);
    console.log('  Program running:', appState.programRunning);

    const result = window._originalRenderProgramList.apply(this, args);

    // Count stop buttons
    const stopButtons = document.querySelectorAll('[data-stop-command]');
    const enabledButtons = [...stopButtons].filter(btn => !btn.disabled).length;
    console.log('  Stop buttons rendered:', stopButtons.length);
    console.log('  Stop buttons ENABLED:', enabledButtons);

    return result;
  };
  console.log('✅ Runtime monitor installed on render.programList');
}

// Test 7: Wrap serialManager.send to monitor commands
if (typeof serialManager !== 'undefined' && serialManager.send) {
  window._originalSend = serialManager.send;
  serialManager.send = async function(command) {
    console.log('%c📡 serialManager.send', 'background: #9900ff; color: white; padding: 4px', command);
    return window._originalSend.call(this, command);
  };
  console.log('✅ Runtime monitor installed on serialManager.send');
}

// Test 8: Check current stop button states
console.log('\n%c[6] Current Stop Button States...', 'color: #00aaff; font-weight: bold');
const stopButtons = document.querySelectorAll('[data-stop-command]');
if (stopButtons.length > 0) {
  const buttonStates = [...stopButtons].map((btn, idx) => ({
    index: btn.dataset.stopCommand,
    disabled: btn.disabled,
    visible: btn.offsetParent !== null
  }));
  console.table(buttonStates);
} else {
  console.warn('⚠️  No stop buttons found in DOM. Add program steps first.');
}

// Test 9: Manual state simulation
console.log('\n%c[7] Manual Test Functions Available:', 'color: #00aaff; font-weight: bold');
console.log('Run these commands to manually test:');
console.log('%c  testRun()', 'color: #ffff00', '- Simulate running state');
console.log('%c  testStop()', 'color: #ffff00', '- Test stop functionality');
console.log('%c  checkState()', 'color: #ffff00', '- Check current state');
console.log('%c  forceRender()', 'color: #ffff00', '- Force re-render program list');

window.testRun = function() {
  console.log('%c[TEST] Forcing program to running state...', 'color: yellow');
  appState.programRunning = true;
  appState.program.forEach((step, idx) => {
    if (step.type === 'set') {
      appState.activeCommands.set(idx, true);
    }
  });
  render.programList();
  console.log('Active commands:', [...appState.activeCommands.keys()]);
  console.log('Check if stop buttons are enabled now!');
};

window.testStop = function() {
  console.log('%c[TEST] Forcing program to stopped state...', 'color: yellow');
  appState.programRunning = false;
  appState.activeCommands.clear();
  render.programList();
  console.log('All commands cleared. Stop buttons should be disabled.');
};

window.checkState = function() {
  console.group('Current State');
  console.log('Program running:', appState.programRunning);
  console.log('Stop requested:', appState.stopRequested);
  console.log('Active commands:', [...appState.activeCommands.entries()]);
  console.log('Program steps:', appState.program.length);
  console.log('Program:', appState.program);

  const stopButtons = document.querySelectorAll('[data-stop-command]');
  console.log('Stop buttons in DOM:', stopButtons.length);
  console.log('Enabled stop buttons:', [...stopButtons].filter(b => !b.disabled).length);
  console.groupEnd();
};

window.forceRender = function() {
  console.log('%c[TEST] Forcing render...', 'color: yellow');
  render.programList();
  console.log('Render complete. Check the UI.');
};

// Final instructions
console.log('\n%c=== NEXT STEPS ===', 'color: #00ff00; font-size: 14px; font-weight: bold');
console.log('1. If no program steps exist, add some SET commands in the UI');
console.log('2. Click the "Run Program" button and watch the console');
console.log('3. You should see colored logs showing each function call');
console.log('4. If nothing happens, run: checkState()');
console.log('5. To manually test stop buttons: testRun()');
console.log('\n%cMonitoring active. Click Run Program now!', 'color: #00ff00; font-size: 14px');

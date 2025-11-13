# Prompt for Claude Code: Zero Control Board GUI Application

## Project Overview
Build a Windows desktop application with an intuitive GUI to communicate with Monodraught's Zero Control Board via USB serial connection (Virtual COM Port). The application must be packaged as a zero-install executable (.exe) that runs without requiring installation or external dependencies.

---

## Technical Requirements

### Tech Stack
- **Language**: Python 3.11+
- **GUI Framework**: PyQt5 or PySide6 (for native look and professional UI)
- **Serial Communication**: pyserial library
- **Packaging**: PyInstaller (to create single-file .exe with no installation required)
- **Data Handling**: Built-in json module for command/response parsing

### Key Dependencies
```
PyQt5>=5.15.0
pyserial>=3.5
PyInstaller>=5.0
```

---

## Core Functionality Requirements

### 1. Serial Connection Management
- Auto-detect available COM ports on startup
- Allow user to select COM port from dropdown
- Connection parameters: 115200 baud, 8 data bits, 1 stop bit, No parity, No flow control
- Visual connection status indicator (connected/disconnected)
- Reconnect button if connection drops
- Send commands with `\r\n` line endings
- Parse responses that use `\r\n` line endings

### 2. Main Application Window
Create a clean, professional interface with:
- **Menu Bar** with at least two dropdown menus:
  - **File Menu**: Exit application
  - **Connection Menu**: Select COM Port, Connect, Disconnect
  - **View Menu**: Switch between Diagnostics and Control Program interfaces
  
- **Toolbar** with quick-access buttons:
  - Connect/Disconnect toggle
  - Refresh COM ports
  - Clear output window
  
- **Status Bar** showing:
  - Connection status
  - Selected COM port
  - Last command timestamp

---

## Interface 1: Diagnostics Interface

### Purpose
Allow individual communication with hardware components for testing, monitoring, and troubleshooting.

### Layout
Create a tabbed interface with the following sections:

#### Tab 1: System Information
- Buttons to query:
  - `uid1`, `uid2`, `uid3` (STM32 unique identifiers)
  - `flash` (flash memory info)
  - `uart` (UART loopback test)
- Display area showing formatted responses

#### Tab 2: File System
- List files button (`filelist` command)
- File browser showing files with sizes
- Read file interface:
  - Filename input
  - Start position input (default: 0)
  - Chunk size input (default: 1000, max: 10000)
  - Read button
  - Text display area for file contents
- File size query (`readfilesize <filename>`)
- Format filesystem button with confirmation dialog (WARNING: erases all data)

#### Tab 3: Configuration
- "Get Complete Config" button (`config` command)
- Tree view displaying configuration in hierarchical format
- "Reset to Defaults" button (`default` command) with confirmation dialog
- Text area showing raw config output

#### Tab 4: Real-Time Data Monitor
- Auto-refresh toggle (update every 1-5 seconds, user configurable)
- Grid/table display showing key parameters:
  - Temperature sensors (Temp Ext, Temp Int, Temp Mix, Temp Coil, Temp HX, Temp 6)
  - Fan data (Fan Supply Out, Fan Extract Out, Fan Supply Tach, Fan Extract Tach)
  - Damper positions and currents
  - Control levels and demands
  - System status indicators
- "Get All Data" button (`data` command)
- Select specific parameters to monitor using checkboxes

#### Tab 5: Custom Command
- Text input field for manual command entry
- Send button
- Command history dropdown (last 20 commands)
- Response display area with timestamp
- Save response to file button

#### Tab 6: Get/Set Parameters
- **GET Section**:
  - Multi-select list of available parameters (from section 3.7 of protocol doc)
  - "Add Parameter" button to build get command
  - "Execute GET" button
  - Response display

- **SET Section**:
  - Parameter dropdown
  - Value input field
  - "Add to Queue" button
  - Queue display showing parameters to be set
  - "Execute SET" button (sends all queued parameters in one command)
  - "Clear Queue" button

---

## Interface 2: Control Program Interface

### Purpose
Create, save, and execute sequences of commands to control the Zero Control Board system. This allows users to build automated control workflows graphically.

### Layout

#### Left Panel: Command Library
- Collapsible tree view organized by category:
  - **File System**: filelist, readfile, readfilesize, format
  - **Configuration**: default, config
  - **System Info**: uid1, uid2, uid3, flash, uart
  - **Data Access**: data, get, set
  - **Control**: recalibrate
  - **Custom**: user-defined commands

#### Center Panel: Program Builder Canvas
- Drag-and-drop interface for building command sequences
- Each command appears as a block/card showing:
  - Command name
  - Parameters (editable)
  - Expected response format
  - Move up/down buttons
  - Delete button
  - Enable/disable toggle

- Visual flow indicators (arrows) between commands
- Add delay between commands option (milliseconds)

#### Right Panel: Command Parameters
When a command block is selected:
- Display all parameters for that command
- Input fields for each parameter with validation:
  - Filename: max 20 characters
  - Numeric ranges with min/max enforcement
  - Dropdown for predefined values where applicable
- Help text explaining each parameter
- Preview of the actual command string that will be sent

#### Bottom Panel: Execution Control
- **Program Management**:
  - Program name input field
  - Save program button (saves to JSON file)
  - Load program button (loads from JSON file)
  - New program button (clears canvas)

- **Execution Controls**:
  - Run button (execute entire sequence)
  - Step button (execute one command at a time)
  - Pause/Resume button
  - Stop button
  - Progress bar showing current command

- **Execution Log**:
  - Scrollable text area showing:
    - Each command sent (with timestamp)
    - Response received
    - Errors or warnings
  - Export log button
  - Clear log button

#### Additional Features for Control Program:
1. **Conditional Logic** (Advanced):
   - If/Then blocks based on response values
   - Example: If "Temp Ext" > 25, then set "Fan Setpoint":80

2. **Loops**:
   - Repeat command block N times
   - Loop until condition met

3. **Variables**:
   - Store response values in variables
   - Use variables in subsequent commands

4. **Error Handling**:
   - Define actions on command failure
   - Retry logic with configurable attempts

---

## Command Protocol Implementation

### Command Format Notes
All commands must adhere to these rules:
- Commands are case-sensitive
- Parameters use JSON-like format: `"key":value`
- Multiple parameters: `"key1":value1,"key2":value2`
- Arrays: `"key":[value1,value2,...]`
- All responses use `\r\n` line endings
- Invalid commands return no response
- Maximum 50 key/value pairs per get/set command
- Maximum 20 characters for filenames
- File read chunks: 1-10000 bytes

### File System Commands

| Command | Format | Response Format |
|---------|--------|----------------|
| readfilesize | `readfilesize <filename>` | `File Size: <filename>\n<size_in_bytes>` |
| readfile | `readfile <filename> <start> <chunksize>` | `Read File: <filename> Size: <actual_size>\n<content>\n*EOF` |
| filelist | `filelist` | `File List:\n./data/<file> <size>\n./<file> <size>\n...\n*EOL` |
| format | `format` | `Format` |

### Configuration Commands

| Command | Format | Response Format |
|---------|--------|----------------|
| default | `default` | `Default` |
| config | `config` | `Config Start\n<config_lines>\nConfig End` |

### System Information Commands

| Command | Format | Response Format |
|---------|--------|----------------|
| uid1 | `uid1` | `"UID1":<numeric_id>` |
| uid2 | `uid2` | `"UID2":<numeric_id>` |
| uid3 | `uid3` | `"UID3":<numeric_id>` |
| flash | `flash` | `"Flash":<manufacturer_string>` |
| uart | `uart` | `"Uart":<received_count>` |

### Data Access Commands

| Command | Format | Response Format |
|---------|--------|----------------|
| data | `data` | `Data Start\n<data_lines>\nData End` |
| get | `get "key1","key2","key3"` | `"key1":value1\n"key2":value2\n"key3":value3` |
| set | `set "key1":value1,"key2":value2` | `"key1":value1\n"key2":value2` |

### Control Commands

| Command | Format | Response Format |
|---------|--------|----------------|
| recalibrate | `recalibrate` | `Recalibrate` |

---

## Available Data Parameters

### Unit Data (Real-time sensor/control data)
```python
UNIT_DATA_PARAMS = [
    # Temperature sensors
    "Temp Ext", "Temp Int", "Temp Mix", "Temp Coil", "Temp HX", "Temp 6", "Ext Filter",
    
    # Fan data
    "Fan Supply Out", "Fan Extract Out", "Fan Supply Tach", "Fan Extract Tach",
    "Raw Fan Speed 1", "Raw Fan Speed 2",
    
    # Servo data
    "Servo 1 Out", "Servo 2 Out", "Servo 3 Out", "Servo 4 Out",
    "Servo 1 Pos", "Servo 2 Pos", "Servo 3 Pos", "Servo 4 Pos",
    
    # Damper outputs
    "Damper Ext Out", "Damper Exhaust Out", "Damper Mix Out", "Damper Grille Out",
    
    # Damper positions
    "Damper Ext Pos", "Damper Exhaust Pos", "Damper Mix Pos", "Damper Grille Pos",
    
    # Damper currents
    "Damper Ext Current", "Damper Exhaust Current", "Damper Mix Current", "Damper Grille Current",
    
    # Damper steps
    "Damper Ext Steps", "Damper Exhaust Steps", "Damper Mix Steps", "Damper Grille Steps",
    
    # Control levels
    "Damper Level", "Valve Level", "Bypass Level",
    
    # Control demands
    "Damper Demand", "Valve Demand",
    
    # System status
    "Inhibit", "Relay", "Fault", "Critical Fault", "Cool Active", "Heat Active", "Config Read",
    
    # Control modes
    "Control Mode", "Raw Mode", "Unit Override", "Override Source",
    
    # Auxiliary temperatures
    "Aux 1 Temp", "Aux 2 Temp", "Aux 3 Temp", "Aux 4 Temp",
    
    # Actuators
    "Actuator Ext Exhaust Pos", "Actuator LPC Pos", "Actuator Airtightness Pos",
    "ActiveLouvre Out", "ActiveLouvre Pos",
    
    # Water availability
    "Hot Water", "Cold Water",
    
    # Configuration status
    "UnitConfigModified"
]
```

### Room Data (Room control parameters)
```python
ROOM_DATA_PARAMS = [
    # Demands
    "Cool Demand", "Heat Demand", "CO2 Demand",
    
    # Levels
    "Cool Level", "Heat Level", "CO2 Level",
    
    # Time
    "Date", "Time",
    
    # Control modes
    "Mode", "Season", "Strategy",
    
    # Environmental settings
    "Draught", "Hot Day",
    
    # Configuration status
    "RoomConfigModified"
]
```

### Modena Data
```python
MODENA_DATA_PARAMS = [
    # Fan control
    "Manual Fan", "Fan Setpoint",
    
    # Grille control
    "Grille Mode", "Grille Setpoint",
    
    # Louvre control
    "Louvre Mode", "Louvre Setpoint",
    
    # Environmental
    "Room CO2", "Room Temp", "Temp Adjust",
    
    # Overrides
    "UI Override"
]
```

### Acuity Data
```python
ACUITY_DATA_PARAMS = [
    # Environmental
    "AcuityExtTemp",
    
    # Overrides
    "Acuity Override",
    
    # External conditions
    "Fire", "Rain", "BMS En"
]
```

### Configuration Data (System settings)
```python
# Room Configuration
ROOM_CONFIG_PARAMS = [
    # Basic settings
    "Room Name", "Cool Setpoint", "Heat Setpoint", "CO2 Setpoint",
    
    # Timing
    "Preheat Start", "Day Start", "Day End", "Weekends",
    
    # Night Cooling
    "Night Cooling", "Night Setpoint", "Night Start", "Night End",
    
    # Advanced Features
    "Adaptive Preheat", "Preheat Rate", "Frost Protect", "Time Zone",
    "Purge Start", "Purge End", "BMS Timeout",
    
    # Strategy settings
    "Adaptive Strategy", "Hot Strategy Temp", "Average Ext Temp",
    "Hot Day Enable", "Northern Hem",
    
    # Auxiliary settings
    "Aux Cool Setpoint", "Aux Heat Setpoint",
    
    # Setback settings
    "Setback Setpoint", "Setback"
]

# Unit Configuration
UNIT_CONFIG_PARAMS = [
    # Identity
    "FW Version", "HW Version", "Model", "Serial Number", "Config Version",
    
    # Hardware features
    "HX", "Cool Valve", "Heat Valve", "Coil", "Extract Only",
    "Use Inhibit", "Relay Type",
    
    # Network settings
    "Parent", "Assigned", "ID",
    
    # Servo configuration
    "Servo 1 Type", "Servo 2 Type", "Servo 3 Type", "Servo 4 Type",
    
    # Damper limits
    "Ext Limit", "Exhaust Limit", "Mix Limit", "Grille Limit",
    
    # Damper types
    "Ext Type", "Exhaust Type", "Mix Type", "Grille Type",
    
    # Control parameters
    "Draught Temp", "Max Supply Day", "Max Extract Day", "Heating Supply",
    
    # PID control gains
    "Damper P Gain", "Damper I Gain", "Valve P Gain", "Valve I Gain",
    
    # Special features
    "LPC Fan Scaling", "Headers Support", "Ventsair Max", "Acoustic Fan"
]
```

---

## Error Handling Requirements

1. **Connection Errors**:
   - Detect when COM port disconnects
   - Show user-friendly error message
   - Offer reconnect option
   - Log error to file

2. **Command Errors**:
   - Timeout after 5 seconds if no response
   - Show warning if command appears invalid (refer to protocol rules)
   - Log failed commands

3. **File System Errors**:
   - Validate filename length (max 20 chars)
   - Validate chunk size (1-10000 bytes)
   - Handle file not found gracefully

4. **Parameter Validation**:
   - Validate numeric ranges before sending
   - Prevent sending more than 50 key/value pairs
   - Warn user of case-sensitivity

---

## User Experience Requirements

### Visual Design
- Modern, clean interface with consistent spacing
- Use color coding:
  - Green for successful operations
  - Red for errors
  - Yellow for warnings
  - Blue for information
- Readable fonts (minimum 10pt)
- Clear visual hierarchy

### Usability
- Tooltips on all buttons explaining their function
- Keyboard shortcuts for common actions:
  - Ctrl+C: Connect
  - Ctrl+D: Disconnect
  - Ctrl+S: Save program
  - Ctrl+O: Open program
  - F5: Run program
  - F10: Step through program
- Undo/Redo for program builder (Ctrl+Z, Ctrl+Y)
- Confirmation dialogs for destructive actions (format, default, delete)

### Documentation
- Help menu with:
  - Quick start guide
  - Command reference (based on protocol document)
  - About dialog showing version info

---

## File Structure

Create a well-organized project structure:

```
zero_control_gui/
├── main.py                      # Application entry point
├── requirements.txt             # Python dependencies
├── gui/
│   ├── __init__.py
│   ├── main_window.py          # Main application window
│   ├── diagnostics_tab.py      # Diagnostics interface
│   ├── control_program_tab.py  # Control program interface
│   ├── connection_dialog.py    # COM port selection
│   └── widgets/
│       ├── __init__.py
│       ├── command_block.py    # Visual command block widget
│       ├── parameter_editor.py # Parameter editing widget
│       └── log_viewer.py       # Log display widget
├── serial_comm/
│   ├── __init__.py
│   ├── serial_handler.py       # Serial communication logic
│   ├── command_builder.py      # Build commands according to protocol
│   └── response_parser.py      # Parse responses from board
├── models/
│   ├── __init__.py
│   ├── control_program.py      # Control program data model
│   ├── command.py              # Command data model
│   └── parameters.py           # Parameter definitions
├── utils/
│   ├── __init__.py
│   ├── logger.py               # Logging utility
│   └── validators.py           # Input validation
├── resources/
│   ├── icons/                  # Application icons
│   └── styles.qss              # Qt stylesheet for styling
└── build_exe.py                # PyInstaller build script
```

---

## Packaging Instructions

### Build Script (build_exe.py)
Create a PyInstaller script that:
- Packages all dependencies
- Includes resource files (icons, styles)
- Creates single-file executable
- Sets application icon
- Specifies Windows manifest for admin privileges if needed

Example PyInstaller command:
```python
pyinstaller --onefile --windowed --icon=resources/icon.ico --name="ZeroControlGUI" main.py
```

### Testing Checklist for .exe
- [ ] Runs on clean Windows machine without Python installed
- [ ] All COM ports detected correctly
- [ ] All GUI elements render properly
- [ ] File operations work correctly
- [ ] Program save/load works
- [ ] Error handling displays correctly
- [ ] Help documentation accessible

---

## Example Usage Scenarios

### Scenario 1: Quick Diagnostics
1. User launches application
2. Selects COM port from dropdown
3. Clicks Connect
4. Navigates to Diagnostics → Real-Time Data Monitor
5. Enables auto-refresh
6. Monitors temperature sensors and fan speeds

### Scenario 2: Creating a Control Program
1. User navigates to Control Program interface
2. Drags "set" command from library to canvas
3. Configures parameters: `"Fan Setpoint":75`
4. Adds delay of 2000ms
5. Drags another "set" command
6. Configures: `"Cool Setpoint":24.0`
7. Saves program as "Standard_Operation.json"
8. Clicks Run to execute sequence

### Scenario 3: File System Management
1. User navigates to Diagnostics → File System
2. Clicks "List Files"
3. Views available files
4. Selects "config.json"
5. Clicks "Read File" with default parameters
6. Reviews configuration in text area
7. Optionally exports to local file

---

## Deliverables

Please provide:

1. **Complete Python source code** following the structure above
2. **requirements.txt** with all dependencies and versions
3. **build_exe.py** script for creating the standalone executable
4. **README.md** with:
   - Installation instructions (for development)
   - How to build the .exe
   - User guide with screenshots (text descriptions of what screenshots would show)
   - Troubleshooting section
5. **Sample control programs** (3-5 JSON files demonstrating common workflows)

---

## Success Criteria

The application is successful if it:
- ✅ Connects reliably to Zero Control Board via USB serial
- ✅ Implements all commands from the VCP protocol correctly
- ✅ Provides intuitive diagnostics interface for testing individual components
- ✅ Enables graphical creation of control programs
- ✅ Packages as single .exe with no installation required
- ✅ Handles errors gracefully with clear user feedback
- ✅ Saves and loads control programs correctly
- ✅ Provides clear documentation for users

---

## Additional Notes

- Assume the user has the Zero Control Board VCP Protocol document (the PDF provided)
- The application must work with Windows 10/11
- Consider future expansion: add support for logging data to CSV, graphing sensor data over time
- Keep code well-commented for future maintenance
- Use threading for serial communication to prevent GUI freezing
- Implement proper cleanup on application exit (close serial port gracefully)
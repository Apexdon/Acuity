from pathlib import Path

path = Path('index.html')
text = path.read_text()

def replace_block(signature, new_block):
    global text
    start = text.index(signature)
    # find next function start by searching for '\n        ' after start
    next_pos = text.find('\n        ', start + len(signature))
    while next_pos != -1 and text[next_pos + 9].isspace():
        next_pos = text.find('\n        ', next_pos + 1)
    if next_pos == -1:
        end = len(text)
    else:
        end = next_pos + 1  # include newline
    text = text[:start] + new_block + text[end:]

replace_block('        monitorSelection() {', "        monitorSelection() {\n          dom.monitorSelection.innerHTML = parameters.map(param => {\n            const active = appState.monitorSelection.has(param.id);\n            return `<label class=\"chip\"><input type=\"checkbox\" data-monitor=\"${param.id}\" ${active ? 'checked' : ''}/> ${param.label}</label>`;\n          }).join('');\n        },\n")
replace_block('        monitorData(data) {', "        monitorData(data) {\n          const now = utils.timestamp();\n          dom.monitorTable.innerHTML = Array.from(appState.monitorSelection).map(key => {\n            const label = parameterLabel(key);\n            const value = data[label] ?? data[key] ?? '--';\n            return `<tr><td>${label}</td><td>${value}</td><td>${now}</td></tr>`;\n          }).join('');\n        },\n")
replace_block('        getQueue() {', "        getQueue() {\n          dom.getQueue.innerHTML = Array.from(appState.getParams).map(param => `<span class=\"chip\">${parameterLabel(param)}<button data-remove-get=\"${param}\">x</button></span>`).join('');\n        },\n")
replace_block('        setQueue() {', "        setQueue() {\n          dom.setQueue.innerHTML = appState.setQueue.map((item, idx) => `\n            <div class=\"command-block\">\n              <h4>${parameterLabel(item.param)}</h4>\n              <p>Value: ${item.value}</p>\n              <button data-remove-set=\"${idx}\">Remove</button>\n            </div>\n          `).join('');\n        },\n")
replace_block('        programList() {', "        programList() {\n          const list = document.getElementById('programList');\n          list.innerHTML = appState.program.map((step, idx) => {\n            const targetLabel = step.type === 'delay' ? 'Delay' : parameterLabel(step.target);\n            return `\n            <div class=\"command-block\">\n              <h4>${step.type.toUpperCase()}</h4>\n              <p>Target: ${targetLabel || '--'} | Value: ${step.value || '--'}</p>\n              <button data-remove-program=\"${idx}\">Remove</button>\n            </div>\n          `;\n          }).join('');\n        }\n")

path.write_text(text, encoding='utf-8')

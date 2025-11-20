from pathlib import Path

path = Path('index.html')
text = path.read_text()

def do(old, new):
    global text
    if old not in text:
        raise SystemExit(f'Missing block: {old.splitlines()[0].strip()}')
    text = text.replace(old, new, 1)

old = "        monitorSelection() {\n          dom.monitorSelection.innerHTML = parameters.map(param => {\n            const active = appState.monitorSelection.has(param);\n            return `<label class=\"chip\"><input type=\"checkbox\" data-monitor=\"${param}\" ${active ? 'checked' : ''}/> ${param}</label>`;\n          }).join('');\n        },\n"
new = "        monitorSelection() {\n          dom.monitorSelection.innerHTML = parameters.map(param => {\n            const active = appState.monitorSelection.has(param.id);\n            return `<label class=\"chip\"><input type=\"checkbox\" data-monitor=\"${param.id}\" ${active ? 'checked' : ''}/> ${param.label}</label>`;\n          }).join('');\n        },\n"
do(old, new)

old = "        monitorData(data) {\n          const now = utils.timestamp();\n          dom.monitorTable.innerHTML = Array.from(appState.monitorSelection).map(key => {\n            const value = data[key] ?? '--';\n            return `<tr><td>${key}</td><td>${value}</td><td>${now}</td></tr>`;\n          }).join('');\n        },\n"
new = "        monitorData(data) {\n          const now = utils.timestamp();\n          dom.monitorTable.innerHTML = Array.from(appState.monitorSelection).map(key => {\n            const label = parameterLabel(key);\n            const value = data[label] ?? data[key] ?? '--';\n            return `<tr><td>${label}</td><td>${value}</td><td>${now}</td></tr>`;\n          }).join('');\n        },\n"
do(old, new)

old = "        getQueue() {\n          dom.getQueue.innerHTML = Array.from(appState.getParams).map(param => `<span class=\"chip\">${param}<button data-remove-get=\"${param}\">x</button></span>`).join('');\n        },\n"
new = "        getQueue() {\n          dom.getQueue.innerHTML = Array.from(appState.getParams).map(param => `<span class=\"chip\">${parameterLabel(param)}<button data-remove-get=\"${param}\">x</button></span>`).join('');\n        },\n"
do(old, new)

old = "        setQueue() {\n          dom.setQueue.innerHTML = appState.setQueue.map((item, idx) => `\n            <div class=\"command-block\">\n              <h4>${item.param}</h4>\n              <p>Value: ${item.value}</p>\n              <button data-remove-set=\"${idx}\">Remove</button>\n            </div>\n          `).join('');\n        },\n"
new = "        setQueue() {\n          dom.setQueue.innerHTML = appState.setQueue.map((item, idx) => `\n            <div class=\"command-block\">\n              <h4>${parameterLabel(item.param)}</h4>\n              <p>Value: ${item.value}</p>\n              <button data-remove-set=\"${idx}\">Remove</button>\n            </div>\n          `).join('');\n        },\n"
do(old, new)

old = "        programList() {\n          const list = document.getElementById('programList');\n          list.innerHTML = appState.program.map((step, idx) => `\n            <div class=\"command-block\">\n              <h4>${step.type.toUpperCase()}</h4>\n              <p>Target: ${step.target || '--'} | Value: ${step.value || '--'}</p>\n              <button data-remove-program=\"${idx}\">Remove</button>\n            </div>\n          `).join('');\n        }\n"
new = "        programList() {\n          const list = document.getElementById('programList');\n          list.innerHTML = appState.program.map((step, idx) => {\n            const targetLabel = step.type === 'delay' ? 'Delay' : parameterLabel(step.target);\n            return `\n            <div class=\"command-block\">\n              <h4>${step.type.toUpperCase()}</h4>\n              <p>Target: ${targetLabel || '--'} | Value: ${step.value || '--'}</p>\n              <button data-remove-program=\"${idx}\">Remove</button>\n            </div>\n          `;\n          }).join('');\n        }\n"
do(old, new)

path.write_text(text, encoding='utf-8')

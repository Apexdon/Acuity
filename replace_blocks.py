from pathlib import Path

path = Path('index.html')
text = path.read_text()

def swap(old, new):
    global text
    if old not in text:
        raise SystemExit(f'Block not found: {old.splitlines()[0]}')
    text = text.replace(old, new, 1)

swap("        monitorData(data) {\n          const now = utils.timestamp();\n          dom.monitorTable.innerHTML = Array.from(appState.monitorSelection).map(key => {\n            const value = data[key] ?? '--';\n            return `<tr><td>${key}</td><td>${value}</td><td>${now}</td></tr>`;\n          }).join('');\n        },\n",
     "        monitorData(data) {\n          const now = utils.timestamp();\n          dom.monitorTable.innerHTML = Array.from(appState.monitorSelection).map(key => {\n            const label = parameterLabel(key);\n            const value = data[label] ?? data[key] ?? '--';\n            return `<tr><td>${label}</td><td>${value}</td><td>${now}</td></tr>`;\n          }).join('');\n        },\n")

swap("        getQueue() {\n          dom.getQueue.innerHTML = Array.from(appState.getParams).map(param => `<span class=\"chip\">${param}<button data-remove-get=\"${param}\">x</button></span>`).join('');\n        },\n",
     "        getQueue() {\n          dom.getQueue.innerHTML = Array.from(appState.getParams).map(param => `<span class=\"chip\">${parameterLabel(param)}<button data-remove-get=\"${param}\">x</button></span>`).join('');\n        },\n")

swap("        setQueue() {\n          dom.setQueue.innerHTML = appState.setQueue.map((item, idx) => `\n            <div class=\"command-block\">\n              <h4>${item.param}</h4>\n              <p>Value: ${item.value}</p>\n              <button data-remove-set=\"${idx}\">Remove</button>\n            </div>\n          `).join('');\n        },\n",
     "        setQueue() {\n          dom.setQueue.innerHTML = appState.setQueue.map((item, idx) => `\n            <div class=\"command-block\">\n              <h4>${parameterLabel(item.param)}</h4>\n              <p>Value: ${item.value}</p>\n              <button data-remove-set=\"${idx}\">Remove</button>\n            </div>\n          `).join('');\n        },\n")

swap("        programList() {\n          const list = document.getElementById('programList');\n          list.innerHTML = appState.program.map((step, idx) => `\n            <div class=\"command-block\">\n              <h4>${step.type.toUpperCase()}</h4>\n              <p>Target: ${step.target || '--'} | Value: ${step.value || '--'}</p>\n              <button data-remove-program=\"${idx}\">Remove</button>\n            </div>\n          `).join('');\n        }\n",
     "        programList() {\n          const list = document.getElementById('programList');\n          list.innerHTML = appState.program.map((step, idx) => {\n            const targetLabel = step.type === 'delay' ? 'Delay' : parameterLabel(step.target);\n            return `\n            <div class=\"command-block\">\n              <h4>${step.type.toUpperCase()}</h4>\n              <p>Target: ${targetLabel || '--'} | Value: ${step.value || '--'}</p>\n              <button data-remove-program=\"${idx}\">Remove</button>\n            </div>\n          `;\n          }).join('');\n        }\n")

path.write_text(text, encoding='utf-8')

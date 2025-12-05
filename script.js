const characters = [
  { name: "Elesis", icon: "Elesis.png" },
  { name: "Lire", icon: "lire.png" },
  { name: "Arme", icon: "arme.png" },
  { name: "Lass", icon: "lass.png" },
  { name: "Ryan", icon: "ryan.png" },
  { name: "Ronan", icon: "ronan.png" },
  { name: "Amy", icon: "amy.png" },
  { name: "Jin", icon: "jin.png" },
  { name: "Sieg", icon: "sieg.png" },
  { name: "Mari", icon: "mari.png" },
  { name: "Dio", icon: "dio.png" },
  { name: "Zero", icon: "zero.png" },
  { name: "Rey", icon: "rey.png" },
  { name: "Lupus", icon: "lupus.png" },
  { name: "Lin", icon: "lin.png" },
  { name: "Azin", icon: "azin.png" },
  { name: "Holy", icon: "holy.png" },
  { name: "Edel", icon: "edel.png" },
  { name: "Veigas", icon: "veigas.png" },
  { name: "Decane", icon: "decane.png" },
  { name: "Ai", icon: "ai.png" },
  { name: "Kalia", icon: "kalia.png" },
  { name: "Uno", icon: "uno.png" },
  { name: "Iris", icon: "iris.png" }
];

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("dragBody");
  const STORAGE_KEY = "gc_voids_table_v2";

  // ---------- Helpers ----------
  function saveState() {
    const rows = [...tbody.querySelectorAll("tr")].map(tr => {
      return {
        name: tr.dataset.name,
        v1: tr.querySelector(".v1").value,
        v2: tr.querySelector(".v2").value,
        v3: tr.querySelector(".v3").value,
        c1: tr.querySelector('input[data-void="1"]').checked,
        c2: tr.querySelector('input[data-void="2"]').checked,
        c3: tr.querySelector('input[data-void="3"]').checked
      };
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
      //console.log("Estado salvo", rows.map(r => r.name));
    } catch (err) {
      console.error("Erro ao salvar localStorage:", err);
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error("Erro ao ler localStorage:", err);
      return null;
    }
  }

  function getDropValue() {
    return document.querySelector('input[name="floor"]:checked').value === "6" ? 6 : 7;
  }

  // ---------- Build table (either from saved state or default list) ----------
  const saved = loadState();

  const source = saved ? saved : characters.map(c => ({ name: c.name, icon: c.icon, v1: 0, v2: 0, v3: 0, c1: false, c2: false, c3: false }));

  // Create rows in the saved order (or default)
  source.forEach(item => {
    // find original icon if saved state doesn't include it
    const original = characters.find(c => c.name === item.name);
    const iconName = item.icon || (original ? original.icon : "");
    const tr = document.createElement("tr");
    tr.dataset.name = item.name; // CRUCIAL: identifier for saving/restoring

    tr.innerHTML = `
      <td class="drag-handle-cell"><span class="drag-handle" draggable="true">≡</span></td>
      <td><img src="icons/${iconName}" class="icon" alt="${item.name}"></td>
      <td>${item.name}</td>

      <td><input type="number" class="void-input v1" value="${item.v1 ?? 0}" min="0"></td>
      <td><input type="number" class="void-input v2" value="${item.v2 ?? 0}" min="0"></td>
      <td><input type="number" class="void-input v3" value="${item.v3 ?? 0}" min="0"></td>

      <td><input type="checkbox" class="check" data-void="1" ${item.c1 ? "checked" : ""}></td>
      <td><input type="checkbox" class="check" data-void="2" ${item.c2 ? "checked" : ""}></td>
      <td><input type="checkbox" class="check" data-void="3" ${item.c3 ? "checked" : ""}></td>

      <td><button class="reset-btn" data-reset="1">Reset</button></td>
      <td><button class="reset-btn" data-reset="2">Reset</button></td>
      <td><button class="reset-btn" data-reset="3">Reset</button></td>
    `;
    tbody.appendChild(tr);
  });

  // ---------- Ensure floor radio always selected ----------
  document.querySelectorAll('input[name="floor"]').forEach(r => {
    r.addEventListener("change", () => {
      if (!document.querySelector('input[name="floor"]:checked')) {
        document.querySelector('input[name="floor"][value="6"]').checked = true;
      }
      localStorage.setItem("gc_floor", document.querySelector('input[name="floor"]:checked').value);
    });
  });
  // load floor if saved
  const savedFloor = localStorage.getItem("gc_floor");
  if (savedFloor) {
    const radio = document.querySelector(`input[name="floor"][value="${savedFloor}"]`);
    if (radio) radio.checked = true;
  }

  // ---------- Checkbox logic (3F / 4F) ----------
  document.addEventListener("change", (e) => {
    if (!e.target.classList.contains("check")) return;
    const row = e.target.closest("tr");
    const tipo = e.target.dataset.void;
    const input = row.querySelector(".v" + tipo);
    let val = parseInt(input.value || "0");
    const drop = getDropValue();
    val = e.target.checked ? val + drop : Math.max(0, val - drop);
    input.value = val;
    saveState();
  });

  // ---------- Manual input saving ----------
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("void-input")) {
      if (parseInt(e.target.value || "0") < 0) e.target.value = 0;
      saveState();
    }
  });

  // ---------- Reset individual (ONLY checkboxes) ----------
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("reset-btn")) return;
    const tipo = e.target.dataset.reset;
    const row = e.target.closest("tr");
    const cb = row.querySelector(`input[data-void="${tipo}"]`);
    if (cb) cb.checked = false;
    saveState();
  });

  // ---------- Reset global (ONLY checkboxes) ----------
  document.querySelectorAll(".reset-global").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const tipo = e.target.dataset.reset;
      document.querySelectorAll(`input[data-void="${tipo}"]`).forEach(cb => cb.checked = false);
      saveState();
    });
  });

  // ---------- Drag & Drop (handle is .drag-handle which is draggable="true") ----------
  let draggedRow = null;

  document.addEventListener("dragstart", (e) => {
    if (!e.target.classList.contains("drag-handle")) return;
    draggedRow = e.target.closest("tr");
    draggedRow.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ""); // firefox fix
  });

  document.addEventListener("dragend", () => {
    if (draggedRow) draggedRow.classList.remove("dragging");
    // after drag finishes, save order
    // use small timeout to ensure DOM is updated
    setTimeout(() => {
      saveState();
      draggedRow = null;
    }, 30);
  });

  tbody.addEventListener("dragover", (e) => {
    e.preventDefault();
    const after = getDragAfterElement(tbody, e.clientY);
    if (!draggedRow) return;
    if (after == null) tbody.appendChild(draggedRow);
    else tbody.insertBefore(draggedRow, after);
  });

  function getDragAfterElement(container, y) {
    const rows = [...container.querySelectorAll("tr:not(.dragging)")];
    return rows.reduce((closest, child) => {
      const rect = child.getBoundingClientRect();
      const offset = y - rect.top - rect.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element || null;
  }

  // ---------- MutationObserver: salva automaticamente se a ordem do tbody mudar (extra confiável) ----------
  const mo = new MutationObserver((mutations) => {
    // se houve reordenação ou inserção/remoção, salva
    let shouldSave = false;
    for (const m of mutations) {
      if (m.type === "childList" && (m.addedNodes.length || m.removedNodes.length)) {
        shouldSave = true;
        break;
      }
    }
    if (shouldSave) {
      // debounce curto para evitar salvar várias vezes
      if (mo._saveTimeout) clearTimeout(mo._saveTimeout);
      mo._saveTimeout = setTimeout(() => {
        saveState();
      }, 50);
    }
  });
  mo.observe(tbody, { childList: true, subtree: false });

  // ---------- Image check (console) ----------
  (function checkImages() {
    const allImgs = document.querySelectorAll("img.icon");
    allImgs.forEach(img => {
      const src = img.getAttribute("src");
      const tester = new Image();
      tester.src = src;
      tester.onload = () => console.log(`✔ Imagem OK: ${src}`);
      tester.onerror = () => console.warn(`❌ Imagem ausente: ${src}`);
    });
  })();

  // ---------- Initial save to ensure state exists ----------
  saveState();
});

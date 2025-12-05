const characters = [
    { name: "Elesis", icon: "Elesis.png" },
    { name: "Lire", icon: "Lire.png" },
    { name: "Arme", icon: "Arme.png" },
    { name: "Lass", icon: "Lass.png" },
    { name: "Ryan", icon: "Ryan.png" },
    { name: "Ronan", icon: "Ronan.png" },
    { name: "Amy", icon: "Amy.png" },
    { name: "Jin", icon: "Jin.png" },
    { name: "Sieg", icon: "Sieg.png" },
    { name: "Mari", icon: "Mari.png" },
    { name: "Dio", icon: "Dio.png" },
    { name: "Zero", icon: "Zero.png" },
    { name: "Rey", icon: "Rey.png" },
    { name: "Lupus", icon: "Lupus.png" },
    { name: "Lin", icon: "Lin.png" },
    { name: "Azin", icon: "Azin.png" },
    { name: "Holy", icon: "Holy.png" },
    { name: "Edel", icon: "Edel.png" },
    { name: "Veigas", icon: "Veigas.png" },
    { name: "Decane", icon: "Decane.png" },
    { name: "Ai", icon: "Ai.png" },
    { name: "Kalia", icon: "Kalia.png" },
    { name: "Uno", icon: "Uno.png" },
    { name: "Iris", icon: "Iris.png" }
];

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("dragBody");

    // ---------------------------------------
    // FUNÇÃO: SALVAR ESTADO
    // ---------------------------------------
    function saveState() {
        const rows = [...tbody.querySelectorAll("tr")].map(row => {
            return {
                name: row.children[2].innerText,
                v1: row.querySelector(".v1").value,
                v2: row.querySelector(".v2").value,
                v3: row.querySelector(".v3").value,
                c1: row.querySelector(`input[data-void="1"]`).checked,
                c2: row.querySelector(`input[data-void="2"]`).checked,
                c3: row.querySelector(`input[data-void="3"]`).checked
            };
        });

        localStorage.setItem("voidTableState", JSON.stringify(rows));
    }

    // ---------------------------------------
    // FUNÇÃO: CARREGAR ESTADO
    // ---------------------------------------
    function loadState() {
        const data = localStorage.getItem("voidTableState");
        if (!data) return null;
        return JSON.parse(data);
    }

    const saved = loadState();

    // ---------------------------------------
    // GERAR TABELA
    // ---------------------------------------
    (saved || characters).forEach(char => {
        const tr = document.createElement("tr");

        const iconName = char.icon || characters.find(c => c.name === char.name)?.icon;

        tr.innerHTML = `
            <td class="drag-handle-cell"><span class="drag-handle" draggable="true">≡</span></td>
            <td><img src="icons/${iconName}" class="icon" alt="${char.name}"></td>
            <td>${char.name}</td>

            <td><input type="number" class="void-input v1" value="${char.v1 || 0}" min="0"></td>
            <td><input type="number" class="void-input v2" value="${char.v2 || 0}" min="0"></td>
            <td><input type="number" class="void-input v3" value="${char.v3 || 0}" min="0"></td>

            <td><input type="checkbox" class="check" data-void="1" ${char.c1 ? "checked" : ""}></td>
            <td><input type="checkbox" class="check" data-void="2" ${char.c2 ? "checked" : ""}></td>
            <td><input type="checkbox" class="check" data-void="3" ${char.c3 ? "checked" : ""}></td>

            <td><button class="reset-btn" data-reset="1">Reset</button></td>
            <td><button class="reset-btn" data-reset="2">Reset</button></td>
            <td><button class="reset-btn" data-reset="3">Reset</button></td>
        `;

        tbody.appendChild(tr);
    });

    // ---------------------------------------
    // 3F = 6 / 4F = 7
    // ---------------------------------------
    function getDropValue() {
        return document.querySelector('input[name="floor"]:checked').value === "6" ? 6 : 7;
    }

    document.addEventListener("change", e => {
        if (!e.target.classList.contains("check")) return;

        const row = e.target.closest("tr");
        const tipo = e.target.dataset.void;
        const input = row.querySelector(".v" + tipo);

        let valor = parseInt(input.value);
        const drop = getDropValue();

        valor = e.target.checked ? valor + drop : Math.max(0, valor - drop);
        input.value = valor;

        saveState();
    });

    // ---------------------------------------
    // IMPEDIR NÚMEROS NEGATIVOS
    // ---------------------------------------
    document.addEventListener("input", e => {
        if (e.target.classList.contains("void-input")) {
            if (parseInt(e.target.value) < 0) e.target.value = 0;
            saveState();
        }
    });

    // ---------------------------------------
    // RESET INDIVIDUAL (somente checkbox)
    // ---------------------------------------
    document.addEventListener("click", e => {
        if (!e.target.classList.contains("reset-btn")) return;

        const tipo = e.target.dataset.reset;
        const row = e.target.closest("tr");

        row.querySelector(`input[data-void="${tipo}"]`).checked = false;

        saveState();
    });

    // ---------------------------------------
    // RESET GLOBAL (somente checkbox)
    // ---------------------------------------
    document.querySelectorAll(".reset-global").forEach(btn => {
        btn.addEventListener("click", e => {
            const tipo = e.target.dataset.reset;

            document.querySelectorAll(`input[data-void="${tipo}"]`).forEach(cb => cb.checked = false);

            saveState();
        });
    });

    // ---------------------------------------
    // DRAG & DROP
    // ---------------------------------------
    let draggedRow = null;

    document.addEventListener("dragstart", e => {
        if (!e.target.classList.contains("drag-handle")) return;

        draggedRow = e.target.closest("tr");
        draggedRow.classList.add("dragging");

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "");
    });

    document.addEventListener("dragend", () => {
        if (draggedRow) draggedRow.classList.remove("dragging");
        saveState();
        draggedRow = null;
    });

    tbody.addEventListener("dragover", e => {
        e.preventDefault();

        const after = getDragAfterElement(tbody, e.clientY);

        if (after === null) {
            tbody.appendChild(draggedRow);
        } else {
            tbody.insertBefore(draggedRow, after);
        }
    });

    function getDragAfterElement(container, y) {
        const rows = [...container.querySelectorAll("tr:not(.dragging)")];

        return rows.reduce(
            (closest, child) => {
                const rect = child.getBoundingClientRect();
                const offset = y - rect.top - rect.height / 2;

                if (offset < 0 && offset > closest.offset) {
                    return { offset, element: child };
                }
                return closest;
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }

});

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

    // ----------------------------
    // GERAR TABELA
    // ----------------------------
    characters.forEach(char => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="drag-handle-cell"><span class="drag-handle" draggable="true">≡</span></td>
            <td><img src="icons/${char.icon}" class="icon" alt="${char.name}"></td>
            <td>${char.name}</td>

            <td><input type="number" class="void-input v1" value="0" min="0"></td>
            <td><input type="number" class="void-input v2" value="0" min="0"></td>
            <td><input type="number" class="void-input v3" value="0" min="0"></td>

            <td><input type="checkbox" class="check" data-void="1"></td>
            <td><input type="checkbox" class="check" data-void="2"></td>
            <td><input type="checkbox" class="check" data-void="3"></td>

            <td><button class="reset-btn" data-reset="1">Reset</button></td>
            <td><button class="reset-btn" data-reset="2">Reset</button></td>
            <td><button class="reset-btn" data-reset="3">Reset</button></td>
        `;

        tbody.appendChild(tr);
    });

    // ----------------------------
    // REGRAS 3F = 6 / 4F = 7
    // ----------------------------
    function getDropValue() {
        return document.querySelector('input[name="floor"]:checked').value === "6" ? 6 : 7;
    }

    // ----------------------------
    // CHECKBOX SOMAR / REMOVER
    // ----------------------------
    document.addEventListener("change", e => {
        if (!e.target.classList.contains("check")) return;

        const row = e.target.closest("tr");
        const tipo = e.target.dataset.void;
        const input = row.querySelector(".v" + tipo);

        let valor = parseInt(input.value);
        const drop = getDropValue();

        valor = e.target.checked ? valor + drop : Math.max(0, valor - drop);
        input.value = valor;
    });

    // ----------------------------
    // RESET INDIVIDUAL
    // ----------------------------
    document.addEventListener("click", e => {
        if (!e.target.classList.contains("reset-btn")) return;

        const tipo = e.target.dataset.reset;
        const row = e.target.closest("tr");

        row.querySelector(`.v${tipo}`).value = 0;
        row.querySelector(`input[data-void="${tipo}"]`).checked = false;
    });

    // ----------------------------
    // RESET GLOBAL
    // ----------------------------
    document.querySelectorAll(".reset-global").forEach(btn => {
        btn.addEventListener("click", e => {
            const tipo = e.target.dataset.reset;

            document.querySelectorAll(`.v${tipo}`).forEach(i => i.value = 0);
            document.querySelectorAll(`input[data-void="${tipo}"]`).forEach(cb => cb.checked = false);
        });
    });

    // ----------------------------
    // DRAG & DROP
    // ----------------------------
    let draggedRow = null;

    document.addEventListener("dragstart", e => {
        if (!e.target.classList.contains("drag-handle")) return;

        draggedRow = e.target.closest("tr");
        draggedRow.classList.add("dragging");

        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", ""); // necessário para Firefox
    });

    document.addEventListener("dragend", () => {
        if (draggedRow) draggedRow.classList.remove("dragging");
        draggedRow = null;
    });

    tbody.addEventListener("dragover", e => {
        e.preventDefault();

        const after = getDragAfterElement(tbody, e.clientY);

        if (after === null) tbody.appendChild(draggedRow);
        else tbody.insertBefore(draggedRow, after);
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

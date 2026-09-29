// ============================================================
// Todo List App
// Features: create a task, edit a task, mark a task as done.
// ============================================================

// --- 1. Grab the elements from the page that we need to work with ---
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

// --- 2. Our data ---
// Each task is an object like: { id: 123, text: "Buy milk", done: false }
// We load saved tasks from the browser's storage so they survive a page refresh.
let tasks = loadTasks();

// Which task (by id) is currently being edited. null means "none".
let editingId = null;

// --- 3. Saving and loading ---
function loadTasks() {
  const saved = localStorage.getItem("tasks");
  return saved ? JSON.parse(saved) : [];
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// --- 4. FEATURE 1: Create a task ---
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const text = input.value.trim();
  if (text === "") return; // ignore empty tasks

  tasks.push({ id: Date.now(), text: text, done: false });
  saveTasks();
  render();

  input.value = ""; // clear the box, ready for the next task
  input.focus();
});

// --- 5. FEATURE 2: Edit a task ---
function startEditing(id) {
  editingId = id;
  render();
}

function saveEdit(id, newText) {
  const text = newText.trim();
  if (text !== "") {
    const task = tasks.find((t) => t.id === id);
    task.text = text;
    saveTasks();
  }
  editingId = null;
  render();
}

function cancelEdit() {
  editingId = null;
  render();
}

// --- 6. FEATURE 3: Mark a task as done (or not done) ---
function toggleDone(id) {
  const task = tasks.find((t) => t.id === id);
  task.done = !task.done;
  saveTasks();
  render();
}

// --- 7. Draw the list on the page ---
// Every time something changes, we clear the list and rebuild it from `tasks`.
function render() {
  list.innerHTML = "";

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = task.done ? "task done" : "task";

    if (task.id === editingId) {
      item.appendChild(buildEditRow(task));
    } else {
      item.appendChild(buildNormalRow(task));
    }

    list.appendChild(item);
  }

  // Show the "No tasks yet" message only when the list is empty
  emptyMessage.style.display = tasks.length === 0 ? "block" : "none";
}

// A normal row: [checkbox] task text [Edit]
function buildNormalRow(task) {
  const row = document.createDocumentFragment();

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => toggleDone(task.id));

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const editButton = document.createElement("button");
  editButton.className = "secondary";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => startEditing(task.id));

  row.append(checkbox, text, editButton);
  return row;
}

// An editing row: [text box] [Save] [Cancel]
function buildEditRow(task) {
  const row = document.createDocumentFragment();

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = task.text;

  // Enter saves, Escape cancels
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveEdit(task.id, editInput.value);
    if (event.key === "Escape") cancelEdit();
  });

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", () => saveEdit(task.id, editInput.value));

  const cancelButton = document.createElement("button");
  cancelButton.className = "secondary";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", cancelEdit);

  row.append(editInput, saveButton, cancelButton);

  // Put the cursor in the text box right away
  setTimeout(() => editInput.focus(), 0);
  return row;
}

// --- 8. Draw the list once when the page first loads ---
render();

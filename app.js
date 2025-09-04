const todoForm = document.querySelector('form');
const todoInput = document.getElementById('things-input');
const todoListUL = document.getElementById('todo-list');
/* Darkmode*/ const themeToggle = document.getElementById("theme-toggle");
const body = document.body;
const emptyMessage = document.getElementById('empty-message');

let allTodos = getTodos();
updateTodoList();

todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addTodo();
})
function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText.length > 0) {
        const todoObj = {
            text: todoText,
            completed: false
        }
        allTodos.push(todoObj);
        renderNewTodo(todoObj, allTodos.length - 1);
        saveTodos();
        todoInput.value = '';
    }
}
function updateTodoList(){
    todoListUL.innerHTML = "";
    if (allTodos.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        allTodos.forEach((todo, todoIndex) => {
            const todoItem = createTodoItem(todo, todoIndex);
            todoListUL.append(todoItem);
        });
    }
}
function renderNewTodo(todo, todoIndex) {
    const todoItem = createTodoItem(todo, todoIndex);
    todoItem.classList.add('new-todo');
    todoListUL.append(todoItem);
    emptyMessage.classList.add('hidden');
}
function createTodoItem(todo, todoIndex) {
    const todoId = "todo-"+todoIndex;
    const todoLI = document.createElement("li");
    const todoText = todo.text;
    todoLI.className = "todo";
    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}"/>
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todoText}
        </label>
        <button class="remove-button">
            <svg fill="var(--secondary-color)"xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `;
    const removeButton = todoLI.querySelector(".remove-button");
    removeButton.addEventListener("click", () => {
        removeTodoItem(todoIndex);
    });
    const checkbox = todoLI.querySelector("input");
    checkbox.addEventListener("change", () => {
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
    });
    checkbox.checked = todo.completed;
    return todoLI;
}
function removeTodoItem(todoIndex) {
    const todoItem = todoListUL.children[todoIndex];
    todoItem.classList.add('fade-out');

    for (let i = todoIndex + 1; i < todoListUL.children.length; i++) {
        todoListUL.children[i].classList.add('slide-up');
    }

    todoItem.addEventListener('animationend', () => {
            allTodos = allTodos.filter((_, i) => i !== todoIndex);
            saveTodos();
            updateTodoList();
    }, { once: true });
}
function saveTodos() {
    const todoJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todoJson);
}
function getTodos() {
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}

// Darkmode
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('darkmode');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('darkmode');
    if (document.body.classList.contains('darkmode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});
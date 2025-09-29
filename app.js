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
});

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText.length > 0) {
        const todoObj = {
            id: Date.now(),
            text: todoText,
            completed: false
        }
        allTodos.push(todoObj);
        renderNewTodo(todoObj);
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
        allTodos.forEach((todo) => {
            const todoItem = createTodoItem(todo);
            todoListUL.append(todoItem);
        });
    }
}

function renderNewTodo(todo) {
    const todoItem = createTodoItem(todo);
    todoItem.classList.add('new-todo');
    todoListUL.append(todoItem);
    emptyMessage.classList.add('hidden');
}

function createTodoItem(todo) {
    const todoId = "todo-" + todo.id;
    const todoLI = document.createElement("li");
    todoLI.className = "todo";
    todoLI.setAttribute('draggable', 'true');
    todoLI.setAttribute('data-id', todo.id); 

    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}"/>
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">
            ${todo.text}
        </label>
        <button class="edit-button">
            <svg fill="var(--color-icon-muted)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
        </button>
        <button class="remove-button">
            <svg fill="var(--color-icon-muted)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `;
    // Xoá
    const removeButton = todoLI.querySelector(".remove-button");
    removeButton.addEventListener("click", () => {
        removeTodoItemById(todo.id);
    });
    // Checkbox
    const checkbox = todoLI.querySelector("input");
    checkbox.addEventListener("change", () => {
        const idx = allTodos.findIndex(t => t.id === todo.id);
        if (idx !== -1) {
            allTodos[idx].completed = checkbox.checked;
            saveTodos();
        }
    });
    checkbox.checked = todo.completed;

    // Chỉnh sửa
    const editButton = todoLI.querySelector(".edit-button");
    const todoTextLabel = todoLI.querySelector(".todo-text");
    editButton.addEventListener("click", () => {
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = todo.text;
        editInput.className = "edit-input";
        todoTextLabel.replaceWith(editInput);
        editInput.focus();

        function finishEdit() {
            const newText = editInput.value.trim();
            if (newText.length > 0) {
                const idx = allTodos.findIndex(t => t.id === todo.id);
                if (idx !== -1) {
                    allTodos[idx].text = newText;
                    saveTodos();
                    updateTodoList();
                }
            } else {
                updateTodoList();
            }
        }
        editInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") finishEdit();
        });
        editInput.addEventListener("blur", finishEdit);
    });

    return todoLI;
}

function removeTodoItemById(id) {
    const idx = allTodos.findIndex(t => t.id === id);
    if (idx === -1) return;
    const todoItem = todoListUL.querySelector(`.todo[data-id="${id}"]`);
    if (!todoItem) return;

    todoItem.classList.add('fade-out');
    // Slide up các phần tử phía dưới
    let found = false;
    for (let i = 0; i < todoListUL.children.length; i++) {
        if (todoListUL.children[i] === todoItem) {
            found = true;
            continue;
        }
        if (found) {
            todoListUL.children[i].classList.add('slide-up');
        }
    }

    todoItem.addEventListener('animationend', () => {
        allTodos = allTodos.filter(t => t.id !== id);
        saveTodos();
        updateTodoList();
    }, { once: true });
}

function saveTodos() {
    const todoJson = JSON.stringify(allTodos);
    localStorage.setItem("todos", todoJson);
}

function getTodos() {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    let changed = false;
    todos.forEach(todo => {
        if (!todo.id) {
            todo.id = Date.now() + Math.random();
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem("todos", JSON.stringify(todos));
    }
    return todos;
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

// Kéo thả

let draggedItem = null;

todoListUL.addEventListener('dragstart', e => {
    if (e.target.classList.contains('todo')) {
        draggedItem = e.target;
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }
});

todoListUL.addEventListener('dragend', e => {
    if (draggedItem) {
        setTimeout(() => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }, 0);
        updateTodosOrder();
    }
});

todoListUL.addEventListener('dragover', e => {
    e.preventDefault(); 
    
    const afterElement = getDragAfterElement(todoListUL, e.clientY);
    const dragging = document.querySelector('.dragging');

    if (dragging) {
        if (afterElement == null) {
            if (todoListUL.lastElementChild !== dragging) {
                todoListUL.appendChild(dragging);
            }
        } else {
            if (afterElement !== dragging.nextSibling) {
                todoListUL.insertBefore(dragging, afterElement);
            }
        }
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateTodosOrder() {
    const currentTodos = [...todoListUL.querySelectorAll('.todo')];
    const newTodosOrder = [];

    currentTodos.forEach(todoElement => {
        const todoId = Number(todoElement.getAttribute('data-id'));
        const originalTodo = allTodos.find(todo => todo.id === todoId);
        if (originalTodo) {
            newTodosOrder.push(originalTodo);
        }
    });

    const isChanged = newTodosOrder.some((todo, idx) => todo !== allTodos[idx]);
    if (isChanged) {
        allTodos = newTodosOrder;
        saveTodos();
    }
}
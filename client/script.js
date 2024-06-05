let body = document.querySelector("body");
let container = document.querySelector(".container");
let input = document.createElement("input");
let btn = document.createElement("button");
let btnremove = document.createElement("button");
let list = document.querySelector('.ToDoList');
btn.textContent = "ADD";
btnremove.textContent = "Clear All";

body.appendChild(container);
container.appendChild(input);
container.appendChild(btn);
container.appendChild(btnremove);
container.appendChild(list);

input.addEventListener('keyup', () => {
    if (input.value.trim() != 0) {
        btn.classList.add('active');
    }
});

function createListAdd() {
    if (input.value.trim() != 0) {
        let taskText = input.value.trim();
        createTaskElement(taskText);
        saveTasksToServer();
        input.value = '';
    } else {
        return alert('Enter input!');
    }
}

function RemoveAll() {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    saveTasksToServer();
}

btn.addEventListener('click', () => {
    createListAdd();
});

btnremove.addEventListener('click', () => {
    RemoveAll();
});

function createTaskElement(taskText, isCompleted = false) {
    let list_l = document.createElement("div");
    list_l.setAttribute("class", "list-item");
    list_l.setAttribute("draggable", "true");

    let taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;

    let removebutton = document.createElement("button");
    let markbutton = document.createElement("input");
    let editbutton = document.createElement("button");
    
    removebutton.textContent = '✘';
    removebutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
</svg>`;
    removebutton.setAttribute("class", "delbut");
    markbutton.setAttribute("type", "checkbox");
    markbutton.setAttribute("class", "markbut");
    editbutton.textContent = '✎';
    editbutton.setAttribute("class", "editbut");
   
    list_l.appendChild(markbutton);
    list_l.appendChild(taskSpan);
    list_l.appendChild(editbutton);
    list_l.appendChild(removebutton);
    list.appendChild(list_l);

    if (isCompleted) {
        list_l.classList.add('completed');
        markbutton.checked = true;
        removebutton.disabled = true;
        removebutton.classList.add('disabled');
        editbutton.disabled = true;
        editbutton.classList.add('disabled');
    }

    removebutton.addEventListener('click', () => {
        if (!markbutton.checked) {
            list_l.remove();
            saveTasksToServer();
        }
    });

    markbutton.addEventListener('change', () => {
        list_l.classList.toggle('completed');
        removebutton.disabled = markbutton.checked;
        editbutton.disabled = markbutton.checked;

        if (markbutton.checked) {
            removebutton.classList.add('disabled');
            editbutton.classList.add('disabled');
        } else {
            removebutton.classList.remove('disabled');
            editbutton.classList.remove('disabled');
        }

        saveTasksToServer();
    });

    editbutton.addEventListener('click', () => {
        if (!markbutton.checked) {
            let newTaskText = prompt("Update your task", taskText);
            if (newTaskText && newTaskText.trim() !== "") {
                taskSpan.textContent = newTaskText.trim();
                saveTasksToServer();
            }
        }
    });

    list_l.addEventListener('dragstart', () => {
        list_l.classList.add('dragging');
    });

    list_l.addEventListener('dragend', () => {
        list_l.classList.remove('dragging');
        saveTasksToServer();
    });

    list_l.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(list, e.clientY);
        if (afterElement == null) {
            list.appendChild(list_l);
        } else {
            list.insertBefore(list_l, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.list-item:not(.dragging)')];

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


function saveTasksToServer() {
    const tasks = [];
    list.querySelectorAll('.list-item').forEach(item => {
        tasks.push({
            text: item.querySelector('span').textContent.trim(),
            completed: item.classList.contains('completed')
        });
    });

    fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks)
    });
}

function loadTasksFromServer() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(task => {
                createTaskElement(task.text, task.completed);
            });
        });
}

loadTasksFromServer();

document.addEventListener('DOMContentLoaded', function() {
    const todoColumn = document.getElementById('todo');
    const inProgressColumn = document.getElementById('inProgress');
    const doneColumn = document.getElementById('done');

    function loadLinks() {
        chrome.storage.sync.get('roboticsLinks', function(data) {
            const links = data.roboticsLinks || [];
            todoColumn.innerHTML = '<h2>Todo</h2>';
            links.forEach((link, index) => {
                const jobItem = createJobItem(link, index);
                todoColumn.appendChild(jobItem);
            });
        });
    }

    function createJobItem(link, index) {
        const jobItem = document.createElement('div');
        jobItem.className = 'job-item';
        jobItem.draggable = true;
        jobItem.id = `job-${index}`;
        jobItem.innerHTML = `
            <a href="${link.url}" target="_blank">${link.text}</a>
            <button class="delete-btn">Delete</button>
        `;

        jobItem.addEventListener('dragstart', dragStart);
        jobItem.addEventListener('dragend', dragEnd);
        jobItem.querySelector('.delete-btn').addEventListener('click', deleteItem);

        return jobItem;
    }

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    function dragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function deleteItem(e) {
        const jobItem = e.target.parentElement;
        jobItem.remove();
        updateStorage();
    }

    function updateStorage() {
        const links = Array.from(document.querySelectorAll('.job-item a')).map(a => ({
            text: a.textContent,
            url: a.href
        }));
        chrome.storage.sync.set({roboticsLinks: links});
    }

    [todoColumn, inProgressColumn, doneColumn].forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable && !column.contains(draggable)) {
                column.appendChild(draggable);
            }
        });

        column.addEventListener('drop', function(e) {
            e.preventDefault();
            updateStorage();
        });
    });

    loadLinks();
});

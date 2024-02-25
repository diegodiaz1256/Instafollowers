function readFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const contents = e.target.result;
        const json = JSON.parse(contents);
        callback(json);
    };
    reader.readAsText(file);
}

function compareFollowers() {
    const followersInput = document.getElementById('followersInput').files[0];
    const followingInput = document.getElementById('followingInput').files[0];

    if (!followersInput || !followingInput) {
        alert('Por favor, carga ambos archivos.');
        return;
    }

    readFile(followersInput, (followersJson) => {
        const followers = followersJson.map((follower) => {
            return follower.string_list_data[0].value;
        });

        readFile(followingInput, (followingJson) => {
            const following = followingJson.relationships_following.map((following) => {
                return following.string_list_data[0].value;
            });
            const notFollowingBack = following.filter((user) => !followers.includes(user));
            document.getElementById("nofolownum").innerHTML = `${notFollowingBack.length}/${following.length}`
            window.notFollowingBackResult = notFollowingBack.join('\n');
            document.getElementById('downloadButton').style.display = 'inline';
            const list = document.getElementById('notFollowingBackList');
            list.innerHTML = ''; // Limpiar lista anterior
            notFollowingBack.forEach((user) => {
                const listItem = document.createElement('li');
                listItem.textContent = user;
                list.appendChild(listItem);
            });
        });
    });
}
function downloadResult() {
    if (!window.notFollowingBackResult) {
        alert('No hay resultados para descargar.');
        return;
    }

    const blob = new Blob([window.notFollowingBackResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notFollowingBack.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

}
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}
function handleFileSelect(inputFile, dropArea, file = null) {
    if (file) {
        inputFile.files = new FileList([file]);
    }

    if (inputFile.files.length > 0) {
        dropArea.querySelector("p").innerHTML = `<p>Archivo cargado: ${inputFile.files[0].name}</p>`
    }
}
function setupDragAndDrop() {
    ['followers', 'following'].forEach(inputId => {
        const dropArea = document.getElementById(`dropArea${inputId.charAt(0).toUpperCase() + inputId.slice(1,)}`);
        const fileInput = document.getElementById(inputId + "Input");
        fileInput.onchange = () => handleFileSelect(fileInput, dropArea);

        dropArea.onclick = () => fileInput.click();
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
            dropArea.addEventListener(event, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(event => {
            dropArea.addEventListener(event, () => dropArea.classList.add('dragover'), false);
        });
        ['dragleave', 'drop'].forEach(event => {
            dropArea.addEventListener(event, () => dropArea.classList.remove('dragover'), false);
        });
        dropArea.ondrop = function (evt) {
            evt.preventDefault();
            fileInput.files = evt.dataTransfer.files;
            //compareFollowers();
        };
        dropArea.addEventListener('drop', (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;

            handleFileSelect(fileInput, dropArea, files[0]);
        }, false);

        //fileInput.onchange = () => compareFollowers();
    });
}

document.addEventListener('DOMContentLoaded', setupDragAndDrop);

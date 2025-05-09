let deleteProjectId = null;

function confirmDelete(id) {
    deleteProjectId = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function hideDeleteModal() {
    deleteProjectId = null;
    document.getElementById('deleteModal').classList.add('hidden');
}

async function deleteConfirmed() {
    if (!deleteProjectId) return;

    try {
        const response = await fetch(`/user/projects/${deleteProjectId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            location.reload();
        } else {
            alert("Failed to delete project.");
        }
    } catch (error) {
        alert("An error occurred.");
    } finally {
        hideDeleteModal();
    }
}
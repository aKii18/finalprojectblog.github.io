// To Get Post
async function fetchPosts() {
    const storedPosts = JSON.parse(sessionStorage.getItem('posts'));
    if (storedPosts) {
        renderPosts(storedPosts);
    } else {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const posts = await response.json();
        renderPosts(posts);

        sessionStorage.setItem('posts', JSON.stringify(posts));
    }
}

// Render Posts
function renderPosts(posts) {
    const container = document.getElementById('post-container');
    container.innerHTML = posts.map(post => `
        <div class="post" data-id="${post.id}">
            <div>
                <h2>${post.title}</h2>
                <p>${post.body}</p>
            </div>
            <div class="button-con">
                <button onclick="editPost(${post.id})">Edit</button>
                <button onclick="deletePost(${post.id})">Delete</button>
            </div>

        </div>
    `).join('');
}

// Fetch posts when the page loads
fetchPosts();

// Open and Close Add Post Modal
function openAddModal() {
    const modal = document.getElementById('add-modal');
    modal.style.display = 'flex';
}

function closeAddModal() {
    const modal = document.getElementById('add-modal');
    modal.style.display = 'none';
}

let isAdding = false; // Flag to prevent multiple submissions

async function addPost(event) {
    event.preventDefault();

    if (isAdding) return; // Prevent double submission
    isAdding = true; // Set the flag to true

    const title = document.getElementById('add-title').value;
    const body = document.getElementById('add-body').value;

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, body }),
        });

        if (response.ok) {
            const newPost = await response.json();

            // Update sessionStorage (add to top)
            const storedPosts = JSON.parse(sessionStorage.getItem('posts')) || [];
            storedPosts.unshift(newPost); // Add new post to the top
            sessionStorage.setItem('posts', JSON.stringify(storedPosts));

            // Re-fetch the posts to get the updated data from sessionStorage
            fetchPosts();

            // Clear and close the Add Post modal
            document.getElementById('add-form').reset();
            closeAddModal();

            // Show success modal
            showSuccessMessage('Successfully added!');
        } else {
            console.error('Failed to add post:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding post:', error);
    } finally {
        isAdding = false; // Reset the flag
    }
}

// Open and Close Edit Post Modal
function openModal() {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
}

// Edit Post (update the DOM and sessionStorage)
async function editPost(id) {
    // Get post from sessionStorage
    const storedPosts = JSON.parse(sessionStorage.getItem('posts')) || [];
    const post = storedPosts.find(post => post.id === id);

    if (post) {
        // Populate the form fields in the modal with the current post data
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-body').value = post.body;

        // Open the modal for editing
        openModal();

        // Handle form submission for updating the post
        const editForm = document.getElementById('edit-form');
        editForm.onsubmit = async (e) => {
            e.preventDefault();

            const updatedPost = {
                title: document.getElementById('edit-title').value,
                body: document.getElementById('edit-body').value,
            };

            // Update sessionStorage
            const updatedPosts = storedPosts.map(post =>
                post.id === id ? { ...post, ...updatedPost } : post
            );
            sessionStorage.setItem('posts', JSON.stringify(updatedPosts));

            // Find the post element in the DOM and update its content
            const postElement = document.querySelector(`.post[data-id="${id}"]`);
            if (postElement) {
                postElement.querySelector('h2').textContent = updatedPost.title;
                postElement.querySelector('p').textContent = updatedPost.body;
            }

            // Close the modal after updating
            closeModal();

            // Show success modal
            showSuccessMessage('Successfully updated!');
        };
    }
}

// Delete Post (remove from sessionStorage and update the DOM)
async function deletePost(id) {
    try {
        // Get posts from sessionStorage
        const storedPosts = JSON.parse(sessionStorage.getItem('posts')) || [];
        const updatedPosts = storedPosts.filter(post => post.id !== id);
        sessionStorage.setItem('posts', JSON.stringify(updatedPosts));

        // Remove from DOM
        const postElement = document.querySelector(`.post[data-id="${id}"]`);
        if (postElement) {
            postElement.remove();
        }

        // Show success modal
        showSuccessMessage('Successfully deleted!');
    } catch (error) {
        console.error(`Error deleting post with id ${id}:`, error);
    }
}

// Show Success Modal
function showSuccessMessage(message) {
    const successModal = document.getElementById('success-modal');
    const successMessage = document.getElementById('success-message');
    successMessage.textContent = message;

    successModal.style.display = 'flex';
}

// Close Success Modal
function closeSuccessModal() {
    const successModal = document.getElementById('success-modal');
    successModal.style.display = 'none';
}


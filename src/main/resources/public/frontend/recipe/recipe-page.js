/** 
 * This script defines the CRUD operations for Recipe objects in the Recipe Management Application. 
 */

const BASE_URL = "http://localhost:8081"; // backend URL
let recipes = [];

// Wait for DOM to fully load before accessing elements
window.addEventListener("DOMContentLoaded", () => {
    // Get references to various DOM elements
    const addRecipeNameInput = document.getElementById('add-recipe-name-input');
    const addRecipeInstructionsInput = document.getElementById('add-recipe-instructions-input');
    const addRecipeButton = document.getElementById('add-recipe-submit-input');
    
    const updateRecipeNameInput = document.getElementById('update-recipe-name-input');
    const updateRecipeInstructionsInput = document.getElementById('update-recipe-instructions-input');
    const updateRecipeButton = document.getElementById('update-recipe-submit-input');
    
    const deleteRecipeNameInput = document.getElementById('delete-recipe-name-input');
    const deleteRecipeButton = document.getElementById('delete-recipe-submit-input');
    
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    const recipeList = document.getElementById('recipe-list');
    const adminLink = document.getElementById('admin-link');
    const logoutButton = document.getElementById('logout-button');

    // Show logout button if auth-token exists in sessionStorage
    if (sessionStorage.getItem('auth-token')) {
        logoutButton.style.display = 'inline-block';
    }

    // Show admin link if is-admin flag in sessionStorage is "true"
    if (sessionStorage.getItem('is-admin') === 'true') {
        adminLink.style.display = 'inline-block';
    }

    // Attach event handlers
    addRecipeButton.addEventListener('click', addRecipe);
    updateRecipeButton.addEventListener('click', updateRecipe);
    deleteRecipeButton.addEventListener('click', deleteRecipe);
    searchButton.addEventListener('click', searchRecipes);
    logoutButton.addEventListener('click', processLogout);

    // On page load, call getRecipes() to populate the list
    getRecipes();

    async function searchRecipes() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            refreshRecipeList(recipes);
        } else {
            const filteredRecipes = recipes.filter(recipe => 
                recipe.name.toLowerCase().includes(searchTerm)
            );
            refreshRecipeList(filteredRecipes);
        }
    }

    async function addRecipe() {
        const name = addRecipeNameInput.value.trim();
        const instructions = addRecipeInstructionsInput.value.trim();

        if (!name || !instructions) {
            console.log('Please enter both recipe name and instructions');
            return;
        }

        const token = sessionStorage.getItem('auth-token');
        if (!token) {
            console.log('Please login first');
            return;
        }

        const requestBody = { name, instructions };
        const requestOptions = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(requestBody)
        };

        try {
            const response = await fetch(`${BASE_URL}/recipes`, requestOptions);
            
            if (response.ok) {
                addRecipeNameInput.value = '';
                addRecipeInstructionsInput.value = '';
                await getRecipes(); // Refresh the list
                console.log('Recipe added successfully!');
            } else {
                console.log('Failed to add recipe');
            }
        } catch (error) {
            console.error('Add recipe error:', error);
        }
    }

    async function updateRecipe() {
        const name = updateRecipeNameInput.value.trim();
        const instructions = updateRecipeInstructionsInput.value.trim();

        if (!name || !instructions) {
            console.log('Please enter both recipe name and new instructions');
            return;
        }

        const token = sessionStorage.getItem('auth-token');
        if (!token) {
            console.log('Please login first');
            return;
        }

        const recipeToUpdate = recipes.find(recipe => recipe.name === name);
        if (!recipeToUpdate) {
            console.log('Recipe not found');
            return;
        }

        const requestBody = { instructions };
        const requestOptions = {
            method: "PUT",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(requestBody)
        };

        try {
            const response = await fetch(`${BASE_URL}/recipes/${recipeToUpdate.id}`, requestOptions);
            
            if (response.ok) {
                updateRecipeNameInput.value = '';
                updateRecipeInstructionsInput.value = '';
                await getRecipes(); // Refresh the list
                console.log('Recipe updated successfully!');
            } else {
                console.log('Failed to update recipe');
            }
        } catch (error) {
            console.error('Update recipe error:', error);
        }
    }

    async function deleteRecipe() {
        const name = deleteRecipeNameInput.value.trim();

        if (!name) {
            console.log('Please enter a recipe name to delete');
            return;
        }

        const token = sessionStorage.getItem('auth-token');
        if (!token) {
            console.log('Please login first');
            return;
        }

        const recipeToDelete = recipes.find(recipe => recipe.name === name);
        if (!recipeToDelete) {
            console.log('Recipe not found');
            return;
        }

        const requestOptions = {
            method: "DELETE",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Authorization": "Bearer " + token,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer"
        };

        try {
            const response = await fetch(`${BASE_URL}/recipes/${recipeToDelete.id}`, requestOptions);
            
            if (response.ok) {
                deleteRecipeNameInput.value = '';
                await getRecipes(); // Refresh the list
                console.log('Recipe deleted successfully!');
            } else {
                console.log('Failed to delete recipe');
            }
        } catch (error) {
            console.error('Delete recipe error:', error);
        }
    }

    async function getRecipes() {
        const token = sessionStorage.getItem('auth-token');
        if (!token) {
            console.log('No auth token found');
            return;
        }

        const requestOptions = {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Authorization": "Bearer " + token,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer"
        };

        try {
            const response = await fetch(`${BASE_URL}/recipes`, requestOptions);
            
            if (response.ok) {
                recipes = await response.json();
                refreshRecipeList(recipes);
            } else {
                console.error('Failed to fetch recipes');
            }
        } catch (error) {
            console.error('Get recipes error:', error);
        }
    }

    function refreshRecipeList(recipesToDisplay = recipes) {
        const recipeList = document.getElementById('recipe-list');
        if (!recipeList) {
            console.error('Recipe list element not found');
            return;
        }
        
        recipeList.innerHTML = '';

        recipesToDisplay.forEach(recipe => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${recipe.name}</strong>: ${recipe.instructions}`;
            recipeList.appendChild(listItem);
        });
    }

    async function processLogout() {
        const token = sessionStorage.getItem('auth-token');
        
        if (!token) {
            sessionStorage.clear();
            window.location.href = '../login/login-page.html';
            return;
        }

        const requestOptions = {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Authorization": "Bearer " + token,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            redirect: "follow",
            referrerPolicy: "no-referrer"
        };

        try {
            await fetch(`${BASE_URL}/logout`, requestOptions);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            sessionStorage.clear();
            window.location.href = '../login/login-page.html';
        }
    }
});
// Authentication Logic

// Initialize users database in local storage if not exists
const users = JSON.parse(localStorage.getItem('expense_users')) || [];

function signupUser(name, email, password) {
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email address already in use!' };
    }
    const newUser = { 
        id: 'user_' + Date.now().toString(), 
        name, 
        email, 
        password 
    };
    users.push(newUser);
    localStorage.setItem('expense_users', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return { success: true };
}

function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return { success: false, message: 'Invalid email or password.' };
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true };
}

function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Function to guard protected routes
function requireAuth() {
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        window.location.replace('login.html');
        return null; // Halt execution intuitively
    }
    return JSON.parse(userString);
}

// Function to redirect away from auth routes if already logged in
function redirectIfAuth() {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
        window.location.replace('index.html');
    }
}

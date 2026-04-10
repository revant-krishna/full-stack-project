// Authenticate User
const currentUser = requireAuth();
if(!currentUser) {
    // If not authenticated, requireAuth redirects. But we put a return here just in case script continues execution
    throw new Error('Not authenticated');
}

// Update User Name
document.getElementById('user-greeting').innerText = `Hi, ${currentUser.name.split(' ')[0]}!`;

// Handle Logout
document.getElementById('logout-btn').addEventListener('click', logoutUser);

// DOM Elements
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionListEl = document.getElementById('transaction-list');

const modalOverlay = document.getElementById('transaction-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const transactionForm = document.getElementById('transaction-form');

// Category icons mapping
const categoryIcons = {
    'food': 'bx-restaurant',
    'shopping': 'bx-shopping-bag',
    'transport': 'bx-bus',
    'bills': 'bx-receipt',
    'entertainment': 'bx-film',
    'health': 'bx-pulse',
    'salary': 'bx-money',
    'other': 'bx-dots-horizontal-rounded'
};

// Unique storage key for the current user's transactions
const STORAGE_KEY = `transactions_${currentUser.id}`;

// Initial state
let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Format date
const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

// Generate random ID
const generateID = () => {
    return Math.random().toString(36).substring(2, 9);
};

// Update DOM UI
const updateUI = () => {
    // Calculate totals
    const amounts = transactions.map(transaction => 
        transaction.type === 'income' ? transaction.amount : -transaction.amount
    );

    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;

    // Update Header visually
    totalBalanceEl.innerText = formatCurrency(total);
    totalIncomeEl.innerText = `+${formatCurrency(income)}`;
    totalExpenseEl.innerText = `-${formatCurrency(expense)}`;

    // Render transactions
    transactionListEl.innerHTML = '';

    if (transactions.length === 0) {
        transactionListEl.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-wallet'></i>
                <p>No transactions yet. Add some dynamically!</p>
            </div>
        `;
        return;
    }

    // Sort by newest first
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.classList.add('transaction-item');
        
        const sign = transaction.type === 'income' ? '+' : '-';
        const amountClass = transaction.type === 'income' ? 'income' : 'expense';
        const catClass = `cat-${transaction.category}`;
        const iconName = categoryIcons[transaction.category] || categoryIcons['other'];

        item.innerHTML = `
            <div class="tx-icon">
                <i class='bx ${iconName} ${catClass}'></i>
            </div>
            <div class="tx-details">
                <div class="tx-title">${transaction.title}</div>
                <div class="tx-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="tx-amount ${amountClass}">
                ${sign}${formatCurrency(transaction.amount)}
            </div>
        `;

        // Delete functionality on click
        item.addEventListener('click', () => {
            if(confirm('Delete this transaction?')) {
                removeTransaction(transaction.id);
            }
        });

        transactionListEl.appendChild(item);
    });

    // Save to local storage specific to the user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

// Add new transaction
const addTransaction = (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const amount = +document.getElementById('amount').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const category = document.getElementById('category').value;

    if (!title || !amount) {
        alert('Please add a title and amount');
        return;
    }

    const transaction = {
        id: generateID(),
        title,
        amount,
        type,
        category,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    updateUI();
    closeModal();
    transactionForm.reset();
};

// Remove transaction
const removeTransaction = (id) => {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateUI();
};

// Modal handlers
const openModal = () => {
    modalOverlay.classList.add('active');
};

const closeModal = () => {
    modalOverlay.classList.remove('active');
};

// Event Listeners
openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
transactionForm.addEventListener('submit', addTransaction);

// Init App
const init = () => {
    updateUI();
};

init();

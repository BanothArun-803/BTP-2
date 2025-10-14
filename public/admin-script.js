// Admin Panel JavaScript

// Admin credentials (In production, this should be handled server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'amoeba2024'
};

// Current session state
let isLoggedIn = false;
let currentDataType = null;
let currentOrganism = null;
let currentData = [];

// DOM Elements
const loginModal = document.getElementById('loginModal');
const adminPanel = document.getElementById('adminPanel');
const adminDashboard = document.getElementById('adminDashboard');
const adminContent = document.getElementById('adminContent');
const loginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Data management buttons
    const dataButtons = document.querySelectorAll('.data-btn');
    dataButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const organism = this.getAttribute('data-organism');
            const type = this.getAttribute('data-type');
            loadDataManagement(organism, type);
            
            // Update active button
            dataButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Admin search functionality
    const adminSearchBtn = document.getElementById('adminSearchBtn');
    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminClearSearchBtn = document.getElementById('adminClearSearchBtn');
    
    if (adminSearchBtn) {
        adminSearchBtn.addEventListener('click', performAdminSearch);
    }
    
    if (adminSearchInput) {
        adminSearchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                performAdminSearch();
            }
        });
    }
    
    if (adminClearSearchBtn) {
        adminClearSearchBtn.addEventListener('click', clearAdminSearch);
    }
}

function checkAuthStatus() {
    // Check if admin is already logged in (session storage)
    const adminSession = sessionStorage.getItem('adminLoggedIn');
    if (adminSession === 'true') {
        showAdminPanel();
    } else {
        showLoginModal();
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        hideLoginError();
        showAdminPanel();
    } else {
        showLoginError('Invalid username or password');
    }
}

function handleLogout() {
    isLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    showLoginModal();
    resetAdminPanel();
}

function showLoginModal() {
    loginModal.style.display = 'flex';
    adminPanel.style.display = 'none';
    adminDashboard.style.display = 'none';
    
    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    hideLoginError();
}

function showAdminPanel() {
    loginModal.style.display = 'none';
    adminPanel.style.display = 'flex';
    adminDashboard.style.display = 'flex';
    showWelcomeScreen();
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function hideLoginError() {
    loginError.style.display = 'none';
}

function resetAdminPanel() {
    currentDataType = null;
    currentOrganism = null;
    currentData = [];
    showWelcomeScreen();
    
    // Remove active states
    document.querySelectorAll('.data-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function showWelcomeScreen() {
    adminContent.innerHTML = `
        <div class="welcome-section">
            <h2>Welcome to Admin Panel</h2>
            <p>Select a data type from the sidebar to manage the data.</p>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Datasets</h3>
                    <span id="totalDatasets">11</span>
                </div>
                <div class="stat-card">
                    <h3>Histolytica Files</h3>
                    <span id="histolyticaFiles">4</span>
                </div>
                <div class="stat-card">
                    <h3>Invadens Files</h3>
                    <span id="invadensFiles">7</span>
                </div>
            </div>
        </div>
    `;
}

async function loadDataManagement(organism, dataType) {
    currentOrganism = organism;
    currentDataType = dataType;
    
    // Show loading
    adminContent.innerHTML = '<div class="loading">Loading data...</div>';
    
    try {
        // Load data based on organism and type
        const endpoint = getDataEndpoint(organism, dataType);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText}`);
        }
        
        const data = await response.json();
        currentData = data;
        
        // Display data management interface
        displayDataManagement(organism, dataType, data);
        
    } catch (error) {
        console.error('Error loading data:', error);
        adminContent.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Data</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function getDataEndpoint(organism, dataType) {
    if (organism === 'histolytica') {
        switch (dataType) {
            case 'transcriptomics':
                return 'Data/Entamoeba%20Histolytica/annotated_transcripts.json';
            case 'protein':
                return 'Data/Entamoeba%20Histolytica/annotated_protein.json';
            case 'gene':
                return 'Data/Entamoeba%20Histolytica/gene.json';
            case 'genome':
                return 'Data/Entamoeba%20Histolytica/genome.json';
        }
    } else if (organism === 'invadens') {
        switch (dataType) {
            case 'transcriptomics':
                return 'Data/Entamoeba%20Invadens/EinvadensIP1_AnnotatedTranscripts.json';
            case 'protein':
                return 'Data/Entamoeba%20Invadens/EinvadensIP1_AnnotatedProteins.json';
            case 'cds':
                return 'Data/Entamoeba%20Invadens/EinvadensIP1_AnnotatedCDSs.json';
            case 'genome':
                return 'Data/Entamoeba%20Invadens/EinvadensIP1_Genome.json';
            case 'codon-usage':
                return 'Data/Entamoeba%20Invadens/EinvadensIP1_CodonUsage.json';
            case 'gene-aliases':
                return 'Data/Entamoeba%20Invadens/EinvadensIP1_GeneAliases.json';
            case 'full-gff':
                return 'Data/Entamoeba%20Invadens/AmoebaDB-68_EinvadensIP1.json';
        }
    }
    throw new Error('Unknown organism or data type');
}

function displayDataManagement(organism, dataType, data) {
    const organismName = organism === 'histolytica' ? 'Entamoeba Histolytica' : 'Entamoeba Invadens';
    const dataTypeName = formatDataTypeName(dataType);
    
    adminContent.innerHTML = `
        <div class="data-management">
            <div class="data-header">
                <h2>${organismName} - ${dataTypeName}</h2>
                <div class="data-actions">
                    <button class="action-btn add-btn" onclick="showAddForm()">Add Entry</button>
                    <button class="action-btn export-btn" onclick="exportData()">Export</button>
                    <button class="action-btn backup-btn" onclick="createBackup()">Backup</button>
                </div>
            </div>
            <div class="data-content">
                <p><strong>Total Entries:</strong> ${data.length}</p>
                <div id="dataTableContainer">
                    ${generateDataTable(data, dataType)}
                </div>
            </div>
        </div>
        <div id="formContainer"></div>
    `;
}

function formatDataTypeName(dataType) {
    const names = {
        'transcriptomics': 'Transcriptomics',
        'protein': 'Protein Sequence',
        'gene': 'Gene Data',
        'genome': 'Genome Data',
        'cds': 'CDS Data',
        'codon-usage': 'Codon Usage',
        'gene-aliases': 'Gene Aliases',
        'full-gff': 'Full GFF'
    };
    return names[dataType] || dataType;
}

function generateDataTable(data, dataType) {
    if (!data || data.length === 0) {
        return '<p>No data available.</p>';
    }
    
    // Get first few entries to display (limit for performance)
    const displayData = data.slice(0, 50);
    const hasMore = data.length > 50;
    
    // Generate table based on data type
    let tableHTML = '<table class="data-table"><thead><tr>';
    
    // Get column headers based on data type
    const columns = getTableColumns(dataType, data[0]);
    columns.forEach(col => {
        tableHTML += `<th>${col.header}</th>`;
    });
    tableHTML += '<th>Actions</th></tr></thead><tbody>';
    
    // Generate rows
    displayData.forEach((item, index) => {
        tableHTML += '<tr>';
        columns.forEach(col => {
            const value = getNestedValue(item, col.key);
            const displayValue = truncateText(value, 50);
            tableHTML += `<td title="${escapeHtml(value)}">${escapeHtml(displayValue)}</td>`;
        });
        tableHTML += `
            <td>
                <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
            </td>
        </tr>`;
    });
    
    tableHTML += '</tbody></table>';
    
    if (hasMore) {
        tableHTML += `<p><em>Showing first 50 entries out of ${data.length} total entries.</em></p>`;
    }
    
    return tableHTML;
}

function getTableColumns(dataType, sampleData) {
    // Define columns for different data types
    const columnMaps = {
        'transcriptomics': [
            { key: 'transcript_id', header: 'Transcript ID' },
            { key: 'gene_id', header: 'Gene ID' },
            { key: 'length', header: 'Length' },
            { key: 'sequence_SO', header: 'Sequence SO' }
        ],
        'protein': [
            { key: 'protein_id', header: 'Protein ID' },
            { key: 'gene_id', header: 'Gene ID' },
            { key: 'gene_product', header: 'Product' },
            { key: 'protein_length', header: 'Length' }
        ],
        'gene': [
            { key: '_id', header: 'Gene ID' },
            { key: 'gene_name', header: 'Gene Name' },
            { key: 'gene_type', header: 'Type' },
            { key: 'species', header: 'Species' }
        ],
        'genome': [
            { key: 'sequence_id', header: 'Sequence ID' },
            { key: 'organism', header: 'Organism' },
            { key: 'length', header: 'Length' },
            { key: 'type', header: 'Type' }
        ]
    };
    
    // For Invadens data types with different structure
    if (currentOrganism === 'invadens') {
        if (dataType === 'transcriptomics' || dataType === 'protein' || dataType === 'cds') {
            return [
                { key: 'header', header: 'Header' },
                { key: 'sequence', header: 'Sequence (truncated)' }
            ];
        } else if (dataType === 'codon-usage') {
            return [
                { key: 'CODON', header: 'Codon' },
                { key: 'AA', header: 'Amino Acid' },
                { key: 'FREQ', header: 'Frequency' },
                { key: 'ABUNDANCE', header: 'Abundance' }
            ];
        } else if (dataType === 'full-gff') {
            return [
                { key: 'seqid', header: 'Sequence ID' },
                { key: 'source', header: 'Source' },
                { key: 'type', header: 'Type' },
                { key: 'start', header: 'Start' },
                { key: 'end', header: 'End' }
            ];
        }
    }
    
    return columnMaps[dataType] || [
        { key: Object.keys(sampleData)[0], header: 'ID' },
        { key: Object.keys(sampleData)[1], header: 'Data' }
    ];
}

function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o || {})[k], obj) || 'N/A';
}

function truncateText(text, maxLength) {
    if (!text) return 'N/A';
    const str = String(text);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CRUD Operations
function showAddForm() {
    const formContainer = document.getElementById('formContainer');
    const form = generateEntryForm();
    formContainer.innerHTML = form;
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function editEntry(index) {
    const entry = currentData[index];
    const formContainer = document.getElementById('formContainer');
    const form = generateEntryForm(entry, index);
    formContainer.innerHTML = form;
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

function deleteEntry(index) {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
        // Create backup before deletion
        createBackup();
        
        // Remove entry from current data
        currentData.splice(index, 1);
        
        // Update display
        displayDataManagement(currentOrganism, currentDataType, currentData);
        
        // Show success message
        showSuccessMessage('Entry deleted successfully!');
        
        // Note: In a real application, you would send this to the server
        console.log('Entry deleted. Updated data:', currentData);
    }
}

function generateEntryForm(entry = null, index = null) {
    const isEdit = entry !== null;
    const title = isEdit ? 'Edit Entry' : 'Add New Entry';
    
    let formFields = '';
    
    // Generate form fields based on data type
    if (currentDataType === 'transcriptomics' && currentOrganism === 'histolytica') {
        formFields = `
            <div class="form-row">
                <div>
                    <label for="transcript_id">Transcript ID:</label>
                    <input type="text" id="transcript_id" name="transcript_id" value="${entry?.transcript_id || ''}" required>
                </div>
                <div>
                    <label for="gene_id">Gene ID:</label>
                    <input type="text" id="gene_id" name="gene_id" value="${entry?.gene_id || ''}">
                </div>
            </div>
            <div class="form-row">
                <div>
                    <label for="length">Length:</label>
                    <input type="number" id="length" name="length" value="${entry?.length || ''}">
                </div>
                <div>
                    <label for="sequence_SO">Sequence SO:</label>
                    <input type="text" id="sequence_SO" name="sequence_SO" value="${entry?.sequence_SO || ''}">
                </div>
            </div>
            <div class="form-row full-width">
                <div>
                    <label for="compressed_sequence">Compressed Sequence:</label>
                    <textarea id="compressed_sequence" name="compressed_sequence">${entry?.compressed_sequence || ''}</textarea>
                </div>
            </div>
        `;
    } else if (currentDataType === 'protein' && currentOrganism === 'histolytica') {
        formFields = `
            <div class="form-row">
                <div>
                    <label for="protein_id">Protein ID:</label>
                    <input type="text" id="protein_id" name="protein_id" value="${entry?.protein_id || ''}" required>
                </div>
                <div>
                    <label for="gene_id">Gene ID:</label>
                    <input type="text" id="gene_id" name="gene_id" value="${entry?.gene_id || ''}">
                </div>
            </div>
            <div class="form-row">
                <div>
                    <label for="gene_product">Gene Product:</label>
                    <input type="text" id="gene_product" name="gene_product" value="${entry?.gene_product || ''}">
                </div>
                <div>
                    <label for="protein_length">Protein Length:</label>
                    <input type="number" id="protein_length" name="protein_length" value="${entry?.protein_length || ''}">
                </div>
            </div>
            <div class="form-row full-width">
                <div>
                    <label for="compressed_sequence">Compressed Sequence:</label>
                    <textarea id="compressed_sequence" name="compressed_sequence">${entry?.compressed_sequence || ''}</textarea>
                </div>
            </div>
        `;
    } else {
        // Generic form for other data types
        const sampleData = entry || currentData[0] || {};
        const keys = Object.keys(sampleData);
        
        formFields = keys.map(key => {
            const value = entry ? entry[key] : '';
            const isLongText = typeof value === 'string' && value.length > 100;
            
            return `
                <div class="form-row ${isLongText ? 'full-width' : ''}">
                    <div>
                        <label for="${key}">${key.replace(/_/g, ' ').toUpperCase()}:</label>
                        ${isLongText ? 
                            `<textarea id="${key}" name="${key}">${value}</textarea>` :
                            `<input type="text" id="${key}" name="${key}" value="${value}">`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }
    
    return `
        <div class="admin-form">
            <h3>${title}</h3>
            <form id="entryForm" onsubmit="saveEntry(event, ${index})">
                ${formFields}
                <div class="form-actions">
                    <button type="submit" class="save-btn">Save</button>
                    <button type="button" class="cancel-btn" onclick="cancelForm()">Cancel</button>
                </div>
            </form>
        </div>
    `;
}

function saveEntry(event, index = null) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const entryData = {};
    
    // Convert form data to object
    for (let [key, value] of formData.entries()) {
        // Try to parse numbers
        if (!isNaN(value) && value !== '') {
            entryData[key] = Number(value);
        } else {
            entryData[key] = value;
        }
    }
    
    // Create backup before modification
    createBackup();
    
    if (index !== null) {
        // Edit existing entry
        currentData[index] = entryData;
        showSuccessMessage('Entry updated successfully!');
    } else {
        // Add new entry
        currentData.push(entryData);
        showSuccessMessage('Entry added successfully!');
    }
    
    // Update display
    displayDataManagement(currentOrganism, currentDataType, currentData);
    
    // Note: In a real application, you would send this to the server
    console.log('Data updated:', currentData);
}

function cancelForm() {
    document.getElementById('formContainer').innerHTML = '';
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const dataContent = document.querySelector('.data-content');
    dataContent.insertBefore(successDiv, dataContent.firstChild);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Utility Functions
function exportData() {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentOrganism}_${currentDataType}_export.json`;
    link.click();
    
    showSuccessMessage('Data exported successfully!');
}

function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
        timestamp: timestamp,
        organism: currentOrganism,
        dataType: currentDataType,
        data: [...currentData]
    };
    
    const backupStr = JSON.stringify(backupData, null, 2);
    const backupBlob = new Blob([backupStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(backupBlob);
    link.download = `backup_${currentOrganism}_${currentDataType}_${timestamp}.json`;
    link.click();
    
    console.log('Backup created:', timestamp);
}

// Admin Search Functions
function performAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const clearBtn = document.getElementById('adminClearSearchBtn');
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    if (!currentData || currentData.length === 0) {
        alert('No data loaded. Please select a data type first.');
        return;
    }
    
    // Search through current data based on data type
    let searchResults = [];
    
    if (currentDataType === 'transcriptomics') {
        if (currentOrganism === 'histolytica') {
            searchResults = currentData.filter(item => 
                (item.transcript_id && item.transcript_id.toLowerCase().includes(query)) ||
                (item.gene_id && item.gene_id.toLowerCase().includes(query))
            );
        } else {
            searchResults = currentData.filter(item => 
                (item.header && item.header.toLowerCase().includes(query))
            );
        }
    } else if (currentDataType === 'protein') {
        if (currentOrganism === 'histolytica') {
            searchResults = currentData.filter(item => 
                (item.protein_id && item.protein_id.toLowerCase().includes(query)) ||
                (item.gene_id && item.gene_id.toLowerCase().includes(query))
            );
        } else {
            searchResults = currentData.filter(item => 
                (item.header && item.header.toLowerCase().includes(query))
            );
        }
    } else if (currentDataType === 'gene') {
        searchResults = currentData.filter(item => 
            (item._id && item._id.toLowerCase().includes(query)) ||
            (item.gene_name && item.gene_name.toLowerCase().includes(query))
        );
    } else if (currentDataType === 'genome') {
        if (currentOrganism === 'histolytica') {
            searchResults = currentData.filter(item => 
                (item.sequence_id && item.sequence_id.toLowerCase().includes(query))
            );
        } else {
            searchResults = currentData.filter(item => 
                (item.header && item.header.toLowerCase().includes(query))
            );
        }
    } else if (currentDataType === 'cds') {
        searchResults = currentData.filter(item => 
            (item.header && item.header.toLowerCase().includes(query))
        );
    } else if (currentDataType === 'codon-usage') {
        searchResults = currentData.filter(item => 
            (item.CODON && item.CODON.toLowerCase().includes(query)) ||
            (item.AA && item.AA.toLowerCase().includes(query))
        );
    } else if (currentDataType === 'gene-aliases') {
        searchResults = currentData.filter(item => {
            const itemStr = JSON.stringify(item).toLowerCase();
            return itemStr.includes(query);
        });
    } else if (currentDataType === 'full-gff') {
        searchResults = currentData.filter(item => 
            (item.seqid && item.seqid.toLowerCase().includes(query)) ||
            (item.type && item.type.toLowerCase().includes(query))
        );
    }
    
    // Display search results
    displaySearchResults(searchResults, query);
    
    // Show clear button
    clearBtn.style.display = 'inline-block';
}

function displaySearchResults(results, query) {
    const organismName = currentOrganism === 'histolytica' ? 'Entamoeba Histolytica' : 'Entamoeba Invadens';
    const dataTypeName = formatDataTypeName(currentDataType);
    
    adminContent.innerHTML = `
        <div class="data-management">
            <div class="data-header">
                <h2>${organismName} - ${dataTypeName} (Search Results)</h2>
                <div class="data-actions">
                    <button class="action-btn add-btn" onclick="showAddForm()">Add Entry</button>
                    <button class="action-btn export-btn" onclick="exportData()">Export</button>
                    <button class="action-btn backup-btn" onclick="createBackup()">Backup</button>
                </div>
            </div>
            <div class="data-content">
                <div class="search-results-header">
                    <p><strong>Search Results for "${query}":</strong> ${results.length} entries found out of ${currentData.length} total</p>
                </div>
                <div id="dataTableContainer">
                    ${generateDataTable(results, currentDataType)}
                </div>
            </div>
        </div>
        <div id="formContainer"></div>
    `;
}

function clearAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    const clearBtn = document.getElementById('adminClearSearchBtn');
    
    // Clear search input
    searchInput.value = '';
    
    // Hide clear button
    clearBtn.style.display = 'none';
    
    // Reload original data
    if (currentOrganism && currentDataType) {
        displayDataManagement(currentOrganism, currentDataType, currentData);
    }
}

// Warning message for data modifications
window.addEventListener('beforeunload', function(e) {
    if (currentData && currentData.length > 0) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        e.returnValue = message;
        return message;
    }
});

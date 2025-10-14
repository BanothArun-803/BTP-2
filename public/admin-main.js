// Integrated Admin Panel functionality for main page

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'amoeba2024'
};

// Admin panel state
let isAdminLoggedIn = false;
let currentAdminData = [];
let currentAdminDataType = '';
let currentAdminOrganism = '';
let currentActiveAdminButton = null;

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminModal = document.getElementById('adminLoginModal');
    const adminClose = document.querySelector('.admin-close');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminLoginError = document.getElementById('adminLoginError');
    const adminPanelOverlay = document.getElementById('adminPanelOverlay');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const adminCloseBtn = document.getElementById('adminCloseBtn');

    // Show admin login modal
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            adminModal.style.display = 'block';
            // Clear form
            document.getElementById('adminUsername').value = '';
            document.getElementById('adminPassword').value = '';
            hideAdminLoginError();
        });
    }

    // Close modal
    if (adminClose) {
        adminClose.addEventListener('click', function() {
            adminModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // Handle admin login form submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            // Validate credentials
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                isAdminLoggedIn = true;
                sessionStorage.setItem('adminLoggedIn', 'true');
                hideAdminLoginError();
                
                // Show admin panel overlay
                showAdminPanel();
                
                // Close login modal
                adminModal.style.display = 'none';
                
                // Clear form
                document.getElementById('adminUsername').value = '';
                document.getElementById('adminPassword').value = '';
            } else {
                showAdminLoginError('Invalid username or password');
            }
        });
    }

    // Admin logout
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            isAdminLoggedIn = false;
            sessionStorage.removeItem('adminLoggedIn');
            hideAdminPanel();
            resetAdminPanel();
        });
    }

    // Close admin panel
    if (adminCloseBtn) {
        adminCloseBtn.addEventListener('click', function() {
            hideAdminPanel();
        });
    }

    // Setup admin data buttons
    setupAdminDataButtons();
    
    // Setup admin search
    setupAdminSearch();
});

function showAdminPanel() {
    const adminPanelOverlay = document.getElementById('adminPanelOverlay');
    adminPanelOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    showAdminWelcomeScreen();
}

function hideAdminPanel() {
    const adminPanelOverlay = document.getElementById('adminPanelOverlay');
    adminPanelOverlay.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
}

function resetAdminPanel() {
    currentAdminDataType = '';
    currentAdminOrganism = '';
    currentAdminData = [];
    showAdminWelcomeScreen();
    
    // Remove active states
    document.querySelectorAll('.data-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function showAdminWelcomeScreen() {
    const adminContent = document.getElementById('adminContent');
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

function setupAdminDataButtons() {
    const dataButtons = document.querySelectorAll('.data-btn');
    dataButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const organism = this.getAttribute('data-organism');
            const type = this.getAttribute('data-type');
            loadAdminDataManagement(organism, type);
            
            // Update active button
            dataButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentActiveAdminButton = this;
        });
    });
}

function setupAdminSearch() {
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

async function loadAdminDataManagement(organism, dataType) {
    currentAdminOrganism = organism;
    currentAdminDataType = dataType;
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = '<div class="loading">Loading data...</div>';
    
    try {
        // Load data based on organism and type
        const endpoint = getAdminDataEndpoint(organism, dataType);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
            throw new Error(`Failed to load data: ${response.statusText}`);
        }
        
        const data = await response.json();
        currentAdminData = data;
        
        // Display data management interface
        displayAdminDataManagement(organism, dataType, data);
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        adminContent.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Data</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function getAdminDataEndpoint(organism, dataType) {
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

function displayAdminDataManagement(organism, dataType, data) {
    const organismName = organism === 'histolytica' ? 'Entamoeba Histolytica' : 'Entamoeba Invadens';
    const dataTypeName = formatAdminDataTypeName(dataType);
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="data-management">
            <div class="data-header">
                <h2>${organismName} - ${dataTypeName}</h2>
                <div class="data-actions">
                    <button class="action-btn add-btn" onclick="showAdminAddForm()">Add Entry</button>
                    <button class="action-btn export-btn" onclick="exportAdminData()">Export</button>
                    <button class="action-btn backup-btn" onclick="createAdminBackup()">Backup</button>
                </div>
            </div>
            <div class="data-content">
                <p><strong>Total Entries:</strong> ${data.length}</p>
                <div id="adminDataTableContainer">
                    ${generateAdminDataTable(data, dataType)}
                </div>
            </div>
        </div>
        <div id="adminFormContainer"></div>
    `;
}

function formatAdminDataTypeName(dataType) {
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

function generateAdminDataTable(data, dataType) {
    if (!data || data.length === 0) {
        return '<p>No data available.</p>';
    }
    
    // Get first few entries to display (limit for performance)
    const displayData = data.slice(0, 50);
    const hasMore = data.length > 50;
    
    // Generate table based on data type
    let tableHTML = '<table class="data-table"><thead><tr>';
    
    // Get column headers based on data type
    const columns = getAdminTableColumns(dataType, data[0]);
    columns.forEach(col => {
        tableHTML += `<th>${col.header}</th>`;
    });
    tableHTML += '<th>Actions</th></tr></thead><tbody>';
    
    // Generate rows
    displayData.forEach((item, index) => {
        tableHTML += '<tr>';
        columns.forEach(col => {
            const value = getAdminNestedValue(item, col.key);
            const displayValue = truncateAdminText(value, 50);
            tableHTML += `<td title="${escapeAdminHtml(value)}">${escapeAdminHtml(displayValue)}</td>`;
        });
        tableHTML += `
            <td>
                <button class="edit-btn" onclick="editAdminEntry(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteAdminEntry(${index})">Delete</button>
            </td>
        </tr>`;
    });
    
    tableHTML += '</tbody></table>';
    
    if (hasMore) {
        tableHTML += `<p><em>Showing first 50 entries out of ${data.length} total entries.</em></p>`;
    }
    
    return tableHTML;
}

function getAdminTableColumns(dataType, sampleData) {
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
    if (currentAdminOrganism === 'invadens') {
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

function getAdminNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o || {})[k], obj) || 'N/A';
}

function truncateAdminText(text, maxLength) {
    if (!text) return 'N/A';
    const str = String(text);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

function escapeAdminHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    
    if (!currentAdminData || currentAdminData.length === 0) {
        alert('No data loaded. Please select a data type first.');
        return;
    }
    
    // Search through current data based on data type
    let searchResults = [];
    
    if (currentAdminDataType === 'transcriptomics') {
        if (currentAdminOrganism === 'histolytica') {
            searchResults = currentAdminData.filter(item => 
                (item.transcript_id && item.transcript_id.toLowerCase().includes(query)) ||
                (item.gene_id && item.gene_id.toLowerCase().includes(query))
            );
        } else {
            searchResults = currentAdminData.filter(item => 
                (item.header && item.header.toLowerCase().includes(query))
            );
        }
    } else if (currentAdminDataType === 'protein') {
        if (currentAdminOrganism === 'histolytica') {
            searchResults = currentAdminData.filter(item => 
                (item.protein_id && item.protein_id.toLowerCase().includes(query)) ||
                (item.gene_id && item.gene_id.toLowerCase().includes(query))
            );
        } else {
            searchResults = currentAdminData.filter(item => 
                (item.header && item.header.toLowerCase().includes(query))
            );
        }
    } else if (currentAdminDataType === 'gene') {
        searchResults = currentAdminData.filter(item => 
            (item._id && item._id.toLowerCase().includes(query)) ||
            (item.gene_name && item.gene_name.toLowerCase().includes(query))
        );
    } else if (currentAdminDataType === 'genome') {
        if (currentAdminOrganism === 'histolytica') {
            searchResults = currentAdminData.filter(item => 
                (item.sequence_id && item.sequence_id.toLowerCase().includes(query))
            );
        } else {
            searchResults = currentAdminData.filter(item => 
                (item.header && item.header.toLowerCase().includes(query))
            );
        }
    } else if (currentAdminDataType === 'cds') {
        searchResults = currentAdminData.filter(item => 
            (item.header && item.header.toLowerCase().includes(query))
        );
    } else if (currentAdminDataType === 'codon-usage') {
        searchResults = currentAdminData.filter(item => 
            (item.CODON && item.CODON.toLowerCase().includes(query)) ||
            (item.AA && item.AA.toLowerCase().includes(query))
        );
    } else if (currentAdminDataType === 'gene-aliases') {
        searchResults = currentAdminData.filter(item => {
            const itemStr = JSON.stringify(item).toLowerCase();
            return itemStr.includes(query);
        });
    } else if (currentAdminDataType === 'full-gff') {
        searchResults = currentAdminData.filter(item => 
            (item.seqid && item.seqid.toLowerCase().includes(query)) ||
            (item.type && item.type.toLowerCase().includes(query))
        );
    }
    
    // Display search results
    displayAdminSearchResults(searchResults, query);
    
    // Show clear button
    clearBtn.style.display = 'inline-block';
}

function displayAdminSearchResults(results, query) {
    const organismName = currentAdminOrganism === 'histolytica' ? 'Entamoeba Histolytica' : 'Entamoeba Invadens';
    const dataTypeName = formatAdminDataTypeName(currentAdminDataType);
    
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="data-management">
            <div class="data-header">
                <h2>${organismName} - ${dataTypeName} (Search Results)</h2>
                <div class="data-actions">
                    <button class="action-btn add-btn" onclick="showAdminAddForm()">Add Entry</button>
                    <button class="action-btn export-btn" onclick="exportAdminData()">Export</button>
                    <button class="action-btn backup-btn" onclick="createAdminBackup()">Backup</button>
                </div>
            </div>
            <div class="data-content">
                <div class="search-results-header">
                    <p><strong>Search Results for "${query}":</strong> ${results.length} entries found out of ${currentAdminData.length} total</p>
                </div>
                <div id="adminDataTableContainer">
                    ${generateAdminDataTable(results, currentAdminDataType)}
                </div>
            </div>
        </div>
        <div id="adminFormContainer"></div>
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
    if (currentAdminOrganism && currentAdminDataType) {
        displayAdminDataManagement(currentAdminOrganism, currentAdminDataType, currentAdminData);
    }
}

// Placeholder functions for CRUD operations
function showAdminAddForm() {
    alert('Add Entry functionality - To be implemented');
}

function editAdminEntry(index) {
    alert(`Edit Entry ${index} functionality - To be implemented`);
}

function deleteAdminEntry(index) {
    if (confirm('Are you sure you want to delete this entry?')) {
        alert(`Delete Entry ${index} functionality - To be implemented`);
    }
}

function exportAdminData() {
    const dataStr = JSON.stringify(currentAdminData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentAdminOrganism}_${currentAdminDataType}_export.json`;
    link.click();
    
    alert('Data exported successfully!');
}

function createAdminBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
        timestamp: timestamp,
        organism: currentAdminOrganism,
        dataType: currentAdminDataType,
        data: [...currentAdminData]
    };
    
    const backupStr = JSON.stringify(backupData, null, 2);
    const backupBlob = new Blob([backupStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(backupBlob);
    link.download = `backup_${currentAdminOrganism}_${currentAdminDataType}_${timestamp}.json`;
    link.click();
    
    alert('Backup created successfully!');
}

function showAdminLoginError(message) {
    const errorDiv = document.getElementById('adminLoginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideAdminLoginError() {
    const errorDiv = document.getElementById('adminLoginError');
    errorDiv.style.display = 'none';
}

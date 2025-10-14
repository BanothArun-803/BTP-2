// Global variables to store current data for searching
let currentTranscriptData = [];
let currentProteinData = [];
let currentGeneData = [];
let currentGenomeData = [];
let currentCDSData = [];
let currentCodonUsageData = [];
let currentGeneAliasesData = [];
let currentFullGFFData = [];
let currentORFData = [];
let currentDataType = '';
let currentActiveButton = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the main organism list toggle
    const organismsToggle = document.getElementById('organisms-toggle');
    const organismsList = document.getElementById('organisms-list');

    // Add a click event listener to the main "Organisms" heading
    if (organismsToggle && organismsList) {
        organismsToggle.addEventListener('click', () => {
            organismsList.classList.toggle('hidden');
            organismsList.classList.toggle('visible');
            organismsToggle.classList.toggle('active');
        });
    }

    // Get all sub-list toggles
    const sublistToggles = document.querySelectorAll('.sublist-toggle');

    // Add a click event listener to each sub-list toggle
    sublistToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const targetList = document.getElementById(targetId);
            
            if (targetList) {
                targetList.classList.toggle('hidden');
                targetList.classList.toggle('visible');
                toggle.classList.toggle('active');
            }
        });
    });

    // Get all organism links
    const organismLinks = document.querySelectorAll('.organism-link');
    console.log('Found organism links:', organismLinks.length);

    // Add click event listeners to organism links
    organismLinks.forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            
            const linkText = link.textContent.trim();
            const dataOrganism = link.getAttribute('data-organism');
            console.log('Clicked link text:', linkText);
            console.log('Data organism:', dataOrganism);
            
            // Remove active class from previously active button
            if (currentActiveButton) {
                currentActiveButton.classList.remove('active');
            }
            
            // Add active class to current button
            const sidebarItem = link.closest('.sidebar-item');
            if (sidebarItem) {
                sidebarItem.classList.add('active');
                currentActiveButton = sidebarItem;
            }
            
            // Show back button
            document.getElementById('backButtonContainer').style.display = 'block';
            
            // Load data for both Entamoeba Histolytica and Entamoeba Invadens
            if (dataOrganism && dataOrganism.includes('Entamoeba Histolytica')) {
                if (linkText === 'Transcriptomics') {
                    console.log('Loading transcriptomics data...');
                    await loadData('transcriptomics', 'histolytica');
                } else if (linkText === 'Protein Sequence') {
                    console.log('Loading protein data...');
                    await loadData('protein', 'histolytica');
                } else if (linkText === 'Gene') {
                    console.log('Loading gene data...');
                    await loadData('gene', 'histolytica');
                } else if (linkText === 'Genome') {
                    console.log('Loading genome data...');
                    await loadData('genome', 'histolytica');
                }
            } else if (dataOrganism && dataOrganism.includes('Entamoeba Invadens')) {
                if (linkText === 'Transcriptomics') {
                    console.log('Loading Entamoeba Invadens transcriptomics data...');
                    await loadData('transcriptomics', 'invadens');
                } else if (linkText === 'Protein Sequence') {
                    console.log('Loading Entamoeba Invadens protein data...');
                    await loadData('protein', 'invadens');
                } else if (linkText === 'CDS') {
                    console.log('Loading Entamoeba Invadens CDS data...');
                    await loadData('cds', 'invadens');
                } else if (linkText === 'Genome') {
                    console.log('Loading Entamoeba Invadens genome data...');
                    await loadData('genome', 'invadens');
                } else if (linkText === 'Codon usage') {
                    console.log('Loading Entamoeba Invadens codon usage data...');
                    await loadData('codon-usage', 'invadens');
                } else if (linkText === 'Gene aliases') {
                    console.log('Loading Entamoeba Invadens gene aliases data...');
                    await loadData('gene-aliases', 'invadens');
                } else if (linkText === 'Full GFF') {
                    console.log('Loading Entamoeba Invadens Full GFF data...');
                    await loadData('full-gff', 'invadens');
                } else if (linkText === 'ORF') {
                    console.log('Loading Entamoeba Invadens ORF data...');
                    await loadData('orf', 'invadens');
                }
            } else {
                console.log('Unknown organism or link:', dataOrganism, linkText);
            }
        });
    });

    // Add event listeners for all search types
    setupSearchListeners('transcript', performTranscriptSearch);
    setupSearchListeners('protein', performProteinSearch);
    setupSearchListeners('gene', performGeneSearch);
    setupSearchListeners('genome', performGenomeSearch);
    setupSearchListeners('cds', performCDSSearch);
    setupSearchListeners('codonUsage', performCodonUsageSearch);
    setupSearchListeners('geneAliases', performGeneAliasesSearch);
    setupSearchListeners('fullGFF', performFullGFFSearch);
    setupSearchListeners('orf', performORFSearch);
    
    // Add back button functionality
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', goBackToHome);
    }
});

function setupSearchListeners(dataType, searchFunction) {
    const searchBtn = document.getElementById(`${dataType}SearchBtn`);
    const searchInput = document.getElementById(`${dataType}SearchInput`);
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchFunction);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchFunction();
            }
        });
    }
}

function createExpandableSection(title, content, isCompressedSequence = false) {
    const section = document.createElement('div');
    section.className = 'expandable-section';
    
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<span class="triangle">▶</span> ${title}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'section-content hidden';
    contentDiv.innerHTML = content;
    
    header.addEventListener('click', () => {
        header.querySelector('.triangle').textContent = contentDiv.classList.contains('hidden') ? '▼' : '▶';
        contentDiv.classList.toggle('hidden');
        
        // Only load compressed sequence data when expanded
        if (isCompressedSequence && !contentDiv.classList.contains('hidden') && !contentDiv.dataset.loaded) {
            contentDiv.innerHTML = `<div class="sequence-data">${content}</div>`;
            contentDiv.dataset.loaded = 'true';
        }
    });
    
    section.appendChild(header);
    section.appendChild(contentDiv);
    return section;
}

function createTranscriptCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Transcript ID: ${item.transcript_id}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Gene ID:</strong> ${item.gene_id || 'N/A'}</p>
        <p><strong>Length:</strong> ${item.length || 'N/A'}</p>
        <p><strong>Sequence SO:</strong> ${item.sequence_SO || 'N/A'}</p>
        <p><strong>SO:</strong> ${item.SO || 'N/A'}</p>
        <p><strong>Is Pseudo:</strong> ${item.is_pseudo || false}</p>
    `);
    
    const sequenceInfo = createExpandableSection('Compressed Sequence', item.compressed_sequence || 'No sequence available', true);
    
    card.appendChild(basicInfo);
    card.appendChild(sequenceInfo);
    
    return card;
}

function createProteinCard(item) {
    console.log('Creating protein card for item:', item);
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Protein ID: ${item.protein_id}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Gene ID:</strong> ${item.gene_id || 'N/A'}</p>
        <p><strong>Product:</strong> ${item.gene_product || 'No product information available'}</p>
        <p><strong>Length:</strong> ${item.protein_length || 'N/A'} aa</p>
        <p><strong>Organism:</strong> ${item.organism || 'N/A'}</p>
        <p><strong>Sequence Type:</strong> ${item.sequence_type || 'N/A'}</p>
    `);
    
    const sequenceInfo = createExpandableSection('Compressed Sequence', item.compressed_sequence || 'No sequence available', true);
    
    card.appendChild(basicInfo);
    card.appendChild(sequenceInfo);
    
    return card;
}

function createGeneCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Gene ID: ${item._id}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Gene Name:</strong> ${item.gene_name || 'N/A'}</p>
        <p><strong>Gene Type:</strong> ${item.gene_type || 'N/A'}</p>
        <p><strong>Biotype Classification:</strong> ${item.biotype_classification || 'N/A'}</p>
        <p><strong>Species:</strong> ${item.species || 'N/A'}</p>
        <p><strong>Strain:</strong> ${item.strain || 'N/A'}</p>
    `);
    
    const locationInfo = createExpandableSection('Genomic Location', `
        <p><strong>Contig:</strong> ${item.genomic_location?.contig || 'N/A'}</p>
        <p><strong>Start:</strong> ${item.genomic_location?.start || 'N/A'}</p>
        <p><strong>End:</strong> ${item.genomic_location?.end || 'N/A'}</p>
        <p><strong>Strand:</strong> ${item.genomic_location?.strand || 'N/A'}</p>
    `);
    
    card.appendChild(basicInfo);
    card.appendChild(locationInfo);
    
    return card;
}

function createGenomeCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Sequence ID: ${item.sequence_id}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Organism:</strong> ${item.organism || 'N/A'}</p>
        <p><strong>Strain:</strong> ${item.strain || 'N/A'}</p>
        <p><strong>Version:</strong> ${item.version || 'N/A'}</p>
        <p><strong>Length:</strong> ${item.length || 'N/A'} bp</p>
        <p><strong>Type:</strong> ${item.type || 'N/A'}</p>
    `);
    
    const sequenceInfo = createExpandableSection('Compressed Sequence', item.compressed_sequence || 'No sequence available', true);
    
    card.appendChild(basicInfo);
    card.appendChild(sequenceInfo);
    
    return card;
}

function hideAllSearchBars() {
    document.getElementById('transcriptSearchContainer').style.display = 'none';
    document.getElementById('proteinSearchContainer').style.display = 'none';
    document.getElementById('geneSearchContainer').style.display = 'none';
    document.getElementById('genomeSearchContainer').style.display = 'none';
    document.getElementById('cdsSearchContainer').style.display = 'none';
    document.getElementById('codonUsageSearchContainer').style.display = 'none';
    document.getElementById('geneAliasesSearchContainer').style.display = 'none';
    document.getElementById('fullGFFSearchContainer').style.display = 'none';
    document.getElementById('orfSearchContainer').style.display = 'none';
}

async function loadData(dataType, organism = 'histolytica') {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '<h2>Loading...</h2>';
    // Store current data type
    currentDataType = dataType;
    
    // Show/hide appropriate search bar based on data type
    hideAllSearchBars();
    
    if (dataType === 'transcriptomics') {
        document.getElementById('transcriptSearchContainer').style.display = 'flex';
    } else if (dataType === 'protein') {
        document.getElementById('proteinSearchContainer').style.display = 'flex';
    } else if (dataType === 'gene') {
        document.getElementById('geneSearchContainer').style.display = 'flex';
    } else if (dataType === 'genome') {
        document.getElementById('genomeSearchContainer').style.display = 'flex';
    } else if (dataType === 'cds') {
        document.getElementById('cdsSearchContainer').style.display = 'flex';
    } else if (dataType === 'codon-usage') {
        document.getElementById('codonUsageSearchContainer').style.display = 'flex';
    } else if (dataType === 'gene-aliases') {
        document.getElementById('geneAliasesSearchContainer').style.display = 'flex';
    } else if (dataType === 'full-gff') {
        document.getElementById('fullGFFSearchContainer').style.display = 'flex';
    } else if (dataType === 'orf') {
        document.getElementById('orfSearchContainer').style.display = 'flex';
    }
    
    try {
        let endpoint = '';
        
        if (organism === 'histolytica') {
            if (dataType === 'transcriptomics') {
                endpoint = 'Data/Entamoeba%20Histolytica/annotated_transcripts.json';
            } else if (dataType === 'protein') {
                endpoint = 'Data/Entamoeba%20Histolytica/annotated_protein.json';
            } else if (dataType === 'gene') {
                endpoint = 'Data/Entamoeba%20Histolytica/gene.json';
            } else if (dataType === 'genome') {
                endpoint = 'Data/Entamoeba%20Histolytica/genome.json';
            }
        } else if (organism === 'invadens') {
            if (dataType === 'transcriptomics') {
                endpoint = 'Data/Entamoeba%20Invadens/EinvadensIP1_AnnotatedTranscripts.json';
            } else if (dataType === 'protein') {
                endpoint = 'Data/Entamoeba%20Invadens/EinvadensIP1_AnnotatedProteins.json';
            } else if (dataType === 'cds') {
                endpoint = 'Data/Entamoeba%20Invadens/EinvadensIP1_AnnotatedCDSs.json';
            } else if (dataType === 'genome') {
                endpoint = 'Data/Entamoeba%20Invadens/EinvadensIP1_Genome.json';
            } else if (dataType === 'codon-usage') {
                endpoint = 'Data/Entamoeba%20Invadens/EinvadensIP1_CodonUsage.json';
            } else if (dataType === 'gene-aliases') {
                endpoint = 'Data/Entamoeba%20Invadens/EinvadensIP1_GeneAliases.json';
            } else if (dataType === 'full-gff') {
                endpoint = 'Data/Entamoeba%20Invadens/AmoebaDB-68_EinvadensIP1.json';
            } else if (dataType === 'orf') {
                endpoint = 'Data/Entamoeba%20Invadens/AmoebaDB-68_EinvadensIP1_Orf50.json';
            }
        }

        console.log('Loading data from:', endpoint);
        console.log('Data type requested:', dataType, 'for organism:', organism);
        
        const response = await fetch(endpoint);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            console.error('Failed to fetch:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        console.log('Parsing JSON...');
        const data = await response.json();
        console.log('Data loaded successfully, items count:', data.length);
        
        // Store data for searching based on type
        if (dataType === 'transcriptomics') {
            currentTranscriptData = data;
        } else if (dataType === 'protein') {
            currentProteinData = data;
        } else if (dataType === 'gene') {
            currentGeneData = data;
        } else if (dataType === 'genome') {
            currentGenomeData = data;
        } else if (dataType === 'cds') {
            currentCDSData = data;
        } else if (dataType === 'codon-usage') {
            currentCodonUsageData = data;
        } else if (dataType === 'gene-aliases') {
            currentGeneAliasesData = data;
        } else if (dataType === 'full-gff') {
            currentFullGFFData = data;
        } else if (dataType === 'orf') {
            currentORFData = data;
        }
        
        resultsContainer.innerHTML = '';
        if (!data || data.length === 0) {
            resultsContainer.innerHTML = '<p>No data available.</p>';
            return;
        }

        console.log('Creating cards for', data.length, 'items');
        data.forEach((item, index) => {
            console.log(`Processing item ${index + 1}:`, item.protein_id || item.transcript_id || item._id || item.sequence_id || item.header || item.seqid);
            let card;
            if (dataType === 'transcriptomics') {
                card = organism === 'invadens' ? createInvadensTranscriptCard(item) : createTranscriptCard(item);
            } else if (dataType === 'protein') {
                card = organism === 'invadens' ? createInvadensProteinCard(item) : createProteinCard(item);
            } else if (dataType === 'gene') {
                card = createGeneCard(item);
            } else if (dataType === 'genome') {
                card = organism === 'invadens' ? createInvadensGenomeCard(item) : createGenomeCard(item);
            } else if (dataType === 'cds') {
                card = createInvadensCDSCard(item);
            } else if (dataType === 'codon-usage') {
                card = createInvadensCodonUsageCard(item);
            } else if (dataType === 'gene-aliases') {
                card = createInvadensGeneAliasesCard(item, index);
            } else if (dataType === 'full-gff') {
                card = createInvadensFullGFFCard(item);
            } else if (dataType === 'orf') {
                card = createInvadensORFCard(item);
            }
            if (card) {
                resultsContainer.appendChild(card);
                console.log('Appended card to container');
            } else {
                console.error('Failed to create card for item:', item);
            }
        });
    } catch (error) {
        console.error(`Failed to load ${dataType} data:`, error);
        console.error('Error details:', error.stack);
        resultsContainer.innerHTML = `<div class="info-card" style="border-left: 4px solid red;"><h4>Error Loading Data</h4><p><strong>Failed to load ${dataType} data:</strong><br>${error.message}</p><p><strong>Endpoint:</strong> ${endpoint || 'Unknown'}</p></div>`;
    }
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert("Please enter a search query.");
        return;
    }

    if (query === "Entamoeba Histolytica Transcriptomics") {
        await loadData('transcriptomics');
    } else if (query === "Entamoeba Histolytica Protein Sequence") {
        await loadData('protein');
    } else if (query === "Entamoeba Histolytica Gene") {
        await loadData('gene');
    } else if (query === "Entamoeba Histolytica Genome") {
        await loadData('genome');
    } else {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '<h2>Searching...</h2>';

        try {
            const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const results = await response.json();
            
            resultsContainer.innerHTML = '';
            if (results.length === 0) {
                resultsContainer.innerHTML = '<p>No results found for "' + query + '".</p>';
            } else {
                results.forEach((item, index) => {
                    const infoCard = document.createElement('div');
                    infoCard.className = 'info-card';
                    infoCard.innerHTML = `
                        <h4>Document ${index + 1}</h4>
                        <h3>${item.gene_id || 'N/A'}</h3>
                        <p>${item.gene_product || 'No description available.'}</p>
                    `;
                    resultsContainer.appendChild(infoCard);
                });
            }
        } catch (error) {
            resultsContainer.innerHTML = `<p style="color: red;">Error: Failed to fetch search results. Check your server connection.</p>`;
            console.error("Failed to fetch search results:", error);
        }
    }
}

function performTranscriptSearch() {
    const searchInput = document.getElementById('transcriptSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Transcript ID to search');
        return;
    }
    
    if (currentTranscriptData.length === 0) {
        alert('No transcript data loaded. Please click on Transcriptomics first.');
        return;
    }
    
    // Search for matching transcript IDs
    const matchingTranscripts = currentTranscriptData.filter(item => {
        return item.transcript_id && item.transcript_id.toLowerCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingTranscripts.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No transcripts found with ID containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different Transcript ID (e.g., EHI_151170A)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingTranscripts.length}</strong> transcript(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching transcripts
        matchingTranscripts.forEach(item => {
            const card = createTranscriptCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`Transcript search for "${query}" found ${matchingTranscripts.length} results`);
}

function performProteinSearch() {
    const searchInput = document.getElementById('proteinSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Protein ID to search');
        return;
    }
    
    if (currentProteinData.length === 0) {
        alert('No protein data loaded. Please click on Protein Sequence first.');
        return;
    }
    
    // Search for matching protein IDs
    const matchingProteins = currentProteinData.filter(item => {
        return item.protein_id && item.protein_id.toLowerCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingProteins.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No proteins found with ID containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different Protein ID (e.g., EHI_151170A-p1)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingProteins.length}</strong> protein(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching proteins
        matchingProteins.forEach(item => {
            const card = createProteinCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`Protein search for "${query}" found ${matchingProteins.length} results`);
}

function performGeneSearch() {
    const searchInput = document.getElementById('geneSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Gene ID to search');
        return;
    }
    
    if (currentGeneData.length === 0) {
        alert('No gene data loaded. Please click on Gene first.');
        return;
    }
    
    // Search for matching gene IDs
    const matchingGenes = currentGeneData.filter(item => {
        return item._id && item._id.toLowerCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingGenes.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No genes found with ID containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different Gene ID (e.g., EHI_151170)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingGenes.length}</strong> gene(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching genes
        matchingGenes.forEach(item => {
            const card = createGeneCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`Gene search for "${query}" found ${matchingGenes.length} results`);
}

function performGenomeSearch() {
    const searchInput = document.getElementById('genomeSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Sequence ID to search');
        return;
    }
    
    if (currentGenomeData.length === 0) {
        alert('No genome data loaded. Please click on Genome first.');
        return;
    }
    
    // Search for matching sequence IDs
    const matchingGenomes = currentGenomeData.filter(item => {
        return item.sequence_id && item.sequence_id.toLowerCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingGenomes.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No genome sequences found with ID containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different Sequence ID</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingGenomes.length}</strong> genome sequence(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching genomes
        matchingGenomes.forEach(item => {
            const card = createGenomeCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`Genome search for "${query}" found ${matchingGenomes.length} results`);
}

// Card creation functions for Entamoeba Invadens data types

function createInvadensTranscriptCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Extract transcript ID from header
    const headerMatch = item.header.match(/^([^|]+)/);
    const transcriptId = headerMatch ? headerMatch[1].trim() : 'Unknown';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Transcript ID: ${transcriptId}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Header:</strong> ${item.header || 'N/A'}</p>
        <p><strong>Length:</strong> ${item.sequence ? item.sequence.length : 'N/A'} bp</p>
    `);
    
    const sequenceInfo = createExpandableSection('Sequence', item.sequence || 'No sequence available', true);
    
    card.appendChild(basicInfo);
    card.appendChild(sequenceInfo);
    
    return card;
}

function createInvadensProteinCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Extract protein ID from header
    const headerMatch = item.header.match(/^([^|]+)/);
    const proteinId = headerMatch ? headerMatch[1].trim() : 'Unknown';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Protein ID: ${proteinId}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Header:</strong> ${item.header || 'N/A'}</p>
        <p><strong>Length:</strong> ${item.sequence ? item.sequence.length : 'N/A'} aa</p>
    `);
    
    const sequenceInfo = createExpandableSection('Protein Sequence', item.sequence || 'No sequence available', true);
    
    card.appendChild(basicInfo);
    card.appendChild(sequenceInfo);
    
    return card;
}

function createInvadensCDSCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Extract CDS ID from header
    const headerMatch = item.header.match(/^([^|]+)/);
    const cdsId = headerMatch ? headerMatch[1].trim() : 'Unknown';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `CDS ID: ${cdsId}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Header:</strong> ${item.header || 'N/A'}</p>
        <p><strong>Length:</strong> ${item.sequence ? item.sequence.length : 'N/A'} bp</p>
    `);
    
    const sequenceInfo = createExpandableSection('CDS Sequence', item.sequence || 'No sequence available', true);
    
    card.appendChild(basicInfo);
    card.appendChild(sequenceInfo);
    
    return card;
}

function createInvadensGenomeCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Extract sequence ID from header
    const headerMatch = item.header.match(/^([^|]+)/);
    const sequenceId = headerMatch ? headerMatch[1].trim() : 'Unknown';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Sequence ID: ${sequenceId}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Basic Information', `
        <p><strong>Header:</strong> ${item.header || 'N/A'}</p>
        <p><strong>Length:</strong> ${item.sequence ? item.sequence.length : 'N/A'} bp</p>
    `);
    
    const sequenceInfo = createExpandableSection('Genome Sequence', item.sequence || 'No sequence available', true);
    
    card.appendChild(basicInfo);
    card.appendChild(sequenceInfo);
    
    return card;
}

function createInvadensCodonUsageCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Codon: ${item.CODON} → ${item.AA}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('Codon Usage Statistics', `
        <p><strong>Codon:</strong> ${item.CODON || 'N/A'}</p>
        <p><strong>Amino Acid:</strong> ${item.AA || 'N/A'}</p>
        <p><strong>Frequency:</strong> ${item.FREQ || 'N/A'}</p>
        <p><strong>Abundance:</strong> ${item.ABUNDANCE || 'N/A'}</p>
    `);
    
    card.appendChild(basicInfo);
    
    return card;
}

function createInvadensGeneAliasesCard(item, index) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `Gene Aliases Set ${index + 1}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    let aliasesHtml = '<div class="aliases-grid">';
    Object.entries(item).forEach(([key, value]) => {
        aliasesHtml += `<p><strong>${key}:</strong> ${value}</p>`;
    });
    aliasesHtml += '</div>';
    
    const basicInfo = createExpandableSection('Gene Aliases', aliasesHtml);
    
    card.appendChild(basicInfo);
    
    return card;
}

function createInvadensFullGFFCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `${item.type || 'Feature'}: ${item.seqid || 'Unknown'}`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('GFF Feature Information', `
        <p><strong>Sequence ID:</strong> ${item.seqid || 'N/A'}</p>
        <p><strong>Source:</strong> ${item.source || 'N/A'}</p>
        <p><strong>Type:</strong> ${item.type || 'N/A'}</p>
        <p><strong>Start:</strong> ${item.start || 'N/A'}</p>
        <p><strong>End:</strong> ${item.end || 'N/A'}</p>
        <p><strong>Score:</strong> ${item.score || 'N/A'}</p>
        <p><strong>Strand:</strong> ${item.strand || 'N/A'}</p>
        <p><strong>Phase:</strong> ${item.phase || 'N/A'}</p>
    `);
    
    let attributesHtml = '';
    if (item.attributes && typeof item.attributes === 'object') {
        Object.entries(item.attributes).forEach(([key, value]) => {
            attributesHtml += `<p><strong>${key}:</strong> ${value}</p>`;
        });
    }
    
    if (attributesHtml) {
        const attributesInfo = createExpandableSection('Attributes', attributesHtml);
        card.appendChild(attributesInfo);
    }
    
    card.appendChild(basicInfo);
    
    return card;
}

function createInvadensORFCard(item) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Main title that's always visible
    const title = document.createElement('h3');
    title.textContent = `ORF: ${item.seqid || 'Unknown'} (${item.start}-${item.end})`;
    card.appendChild(title);
    
    // Create expandable sections for different parts of the data
    const basicInfo = createExpandableSection('ORF Information', `
        <p><strong>Sequence ID:</strong> ${item.seqid || 'N/A'}</p>
        <p><strong>Source:</strong> ${item.source || 'N/A'}</p>
        <p><strong>Type:</strong> ${item.type || 'N/A'}</p>
        <p><strong>Start:</strong> ${item.start || 'N/A'}</p>
        <p><strong>End:</strong> ${item.end || 'N/A'}</p>
        <p><strong>Length:</strong> ${item.start && item.end ? (item.end - item.start + 1) : 'N/A'} bp</p>
        <p><strong>Strand:</strong> ${item.strand || 'N/A'}</p>
        <p><strong>Score:</strong> ${item.score || 'N/A'}</p>
        <p><strong>Phase:</strong> ${item.phase || 'N/A'}</p>
    `);
    
    let attributesHtml = '';
    if (item.attributes && typeof item.attributes === 'object') {
        Object.entries(item.attributes).forEach(([key, value]) => {
            attributesHtml += `<p><strong>${key}:</strong> ${value}</p>`;
        });
    }
    
    if (attributesHtml) {
        const attributesInfo = createExpandableSection('Attributes', attributesHtml);
        card.appendChild(attributesInfo);
    }
    
    card.appendChild(basicInfo);
    
    return card;
}

// Search functions for new Entamoeba Invadens data types

function performCDSSearch() {
    const searchInput = document.getElementById('cdsSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a CDS ID to search');
        return;
    }
    
    if (currentCDSData.length === 0) {
        alert('No CDS data loaded. Please click on CDS first.');
        return;
    }
    
    // Search for matching CDS IDs in header
    const matchingCDS = currentCDSData.filter(item => {
        return item.header && item.header.toLowerCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingCDS.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No CDS found with ID containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different CDS ID (e.g., EIN_000210-t26_1)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingCDS.length}</strong> CDS sequence(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching CDS
        matchingCDS.forEach(item => {
            const card = createInvadensCDSCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`CDS search for "${query}" found ${matchingCDS.length} results`);
}

function performCodonUsageSearch() {
    const searchInput = document.getElementById('codonUsageSearchInput');
    const query = searchInput.value.trim().toUpperCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Codon to search');
        return;
    }
    
    if (currentCodonUsageData.length === 0) {
        alert('No codon usage data loaded. Please click on Codon usage first.');
        return;
    }
    
    // Search for matching codons
    const matchingCodons = currentCodonUsageData.filter(item => {
        return item.CODON && item.CODON.toUpperCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingCodons.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No codon found containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different codon (e.g., UAA, GCU, AUG)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingCodons.length}</strong> codon(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching codons
        matchingCodons.forEach(item => {
            const card = createInvadensCodonUsageCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`Codon usage search for "${query}" found ${matchingCodons.length} results`);
}

function performGeneAliasesSearch() {
    const searchInput = document.getElementById('geneAliasesSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Gene ID to search');
        return;
    }
    
    if (currentGeneAliasesData.length === 0) {
        alert('No gene aliases data loaded. Please click on Gene aliases first.');
        return;
    }
    
    // Search for matching gene IDs in aliases
    const matchingAliases = currentGeneAliasesData.filter((item, index) => {
        return Object.keys(item).some(key => key.toLowerCase().includes(query)) ||
               Object.values(item).some(value => value.toLowerCase().includes(query));
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingAliases.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No gene aliases found containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different Gene ID (e.g., EIN_059730)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingAliases.length}</strong> gene alias set(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching aliases
        matchingAliases.forEach((item, index) => {
            const card = createInvadensGeneAliasesCard(item, index);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`Gene aliases search for "${query}" found ${matchingAliases.length} results`);
}

function performFullGFFSearch() {
    const searchInput = document.getElementById('fullGFFSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Sequence ID to search');
        return;
    }
    
    if (currentFullGFFData.length === 0) {
        alert('No Full GFF data loaded. Please click on Full GFF first.');
        return;
    }
    
    // Search for matching sequence IDs
    const matchingGFF = currentFullGFFData.filter(item => {
        return item.seqid && item.seqid.toLowerCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingGFF.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No GFF features found with sequence ID containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different Sequence ID (e.g., KB207260)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingGFF.length}</strong> GFF feature(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching GFF features
        matchingGFF.forEach(item => {
            const card = createInvadensFullGFFCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`Full GFF search for "${query}" found ${matchingGFF.length} results`);
}

function performORFSearch() {
    const searchInput = document.getElementById('orfSearchInput');
    const query = searchInput.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!query) {
        alert('Please enter a Sequence ID to search');
        return;
    }
    
    if (currentORFData.length === 0) {
        alert('No ORF data loaded. Please click on ORF first.');
        return;
    }
    
    // Search for matching sequence IDs
    const matchingORF = currentORFData.filter(item => {
        return item.seqid && item.seqid.toLowerCase().includes(query);
    });
    
    // Display results
    resultsContainer.innerHTML = '';
    
    if (matchingORF.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-card" style="border-left: 4px solid orange;">
                <h4>No Results Found</h4>
                <p>No ORF found with sequence ID containing "<strong>${searchInput.value}</strong>"</p>
                <p>Try searching with a different Sequence ID (e.g., KB206125)</p>
            </div>
        `;
    } else {
        // Add a header showing search results
        const headerDiv = document.createElement('div');
        headerDiv.className = 'info-card';
        headerDiv.style.backgroundColor = '#e8f5e8';
        headerDiv.style.borderLeft = '4px solid #28a745';
        headerDiv.innerHTML = `
            <h4>Search Results</h4>
            <p>Found <strong>${matchingORF.length}</strong> ORF(s) matching "<strong>${searchInput.value}</strong>"</p>
        `;
        resultsContainer.appendChild(headerDiv);
        
        // Display matching ORFs
        matchingORF.forEach(item => {
            const card = createInvadensORFCard(item);
            resultsContainer.appendChild(card);
        });
    }
    
    console.log(`ORF search for "${query}" found ${matchingORF.length} results`);
}

// Back button functionality
function goBackToHome() {
    // Hide back button
    document.getElementById('backButtonContainer').style.display = 'none';
    
    // Hide all search bars
    hideAllSearchBars();
    
    // Remove active class from current button
    if (currentActiveButton) {
        currentActiveButton.classList.remove('active');
        currentActiveButton = null;
    }
    
    // Reset to home page content
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = `
        <div class="info-card">
            <h4>Information 1</h4>
            <p>Details about Information 1 will be displayed here.</p>
        </div>
        <div class="info-card">
            <h4>Information 2</h4>
            <p>Details about Information 2 will be displayed here.</p>
        </div>
        <div class="info-card">
            <h4>Information 3</h4>
            <p>Details about Information 3 will be displayed here.</p>
        </div>
    `;
    
    // Clear current data type
    currentDataType = '';
    
    console.log('Returned to home page');
}
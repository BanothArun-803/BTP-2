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
            
            // Only load data for Entamoeba Histolytica (since that's the only organism with data)
            if (dataOrganism && dataOrganism.includes('Entamoeba Histolytica')) {
                if (linkText === 'Transcriptomics') {
                    console.log('Loading transcriptomics data...');
                    await loadData('transcriptomics');
                } else if (linkText === 'Protein Sequence') {
                    console.log('Loading protein data...');
                    await loadData('protein');
                } else if (linkText === 'Gene') {
                    console.log('Loading gene data...');
                    await loadData('gene');
                } else if (linkText === 'Genome') {
                    console.log('Loading genome data...');
                    await loadData('genome');
                }
            } else if (dataOrganism && dataOrganism.includes('Entamoeba Invadens')) {
                // Show message that data is not available for Entamoeba Invadens
                const resultsContainer = document.getElementById('resultsContainer');
                resultsContainer.innerHTML = `<div class="info-card"><h4>No Data Available</h4><p>Data for Entamoeba Invadens ${linkText} is not currently available. Please add the corresponding data files to the Data/Entamoeba Invadens/ directory.</p></div>`;
                console.log('No data available for Entamoeba Invadens');
            } else {
                console.log('Unknown organism or link:', dataOrganism, linkText);
            }
        });
    });
});

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

async function loadData(dataType) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '<h2>Loading...</h2>';
    
    try {
        let endpoint = '';
        if (dataType === 'transcriptomics') {
            endpoint = 'Data/Entamoeba%20Histolytica/annotated_transcripts.json';
        } else if (dataType === 'protein') {
            endpoint = 'Data/Entamoeba%20Histolytica/annotated_protein.json';
        } else if (dataType === 'gene') {
            endpoint = 'Data/Entamoeba%20Histolytica/gene.json';
        } else if (dataType === 'genome') {
            endpoint = 'Data/Entamoeba%20Histolytica/genome.json';
        }

        console.log('Loading data from:', endpoint);
        console.log('Data type requested:', dataType);
        
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
        
        resultsContainer.innerHTML = '';
        if (!data || data.length === 0) {
            resultsContainer.innerHTML = '<p>No data available.</p>';
            return;
        }

        console.log('Creating cards for', data.length, 'items');
        data.forEach((item, index) => {
            console.log(`Processing item ${index + 1}:`, item.protein_id || item.transcript_id || item._id || item.sequence_id);
            let card;
            if (dataType === 'transcriptomics') {
                card = createTranscriptCard(item);
            } else if (dataType === 'protein') {
                card = createProteinCard(item);
                console.log('Created protein card for:', item.protein_id);
            } else if (dataType === 'gene') {
                card = createGeneCard(item);
            } else if (dataType === 'genome') {
                card = createGenomeCard(item);
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
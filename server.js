const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test endpoint to check if protein data is accessible
app.get('/test-protein', (req, res) => {
    const fs = require('fs');
    const filePath = path.join(__dirname, 'public', 'Data', 'Entamoeba Histolytica', 'annotated_protein.json');
    
    console.log('Testing protein file access:', filePath);
    
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        res.json({
            exists: true,
            size: stats.size,
            path: filePath,
            message: 'Protein data file is accessible'
        });
    } else {
        res.status(404).json({
            exists: false,
            path: filePath,
            message: 'Protein data file not found'
        });
    }
});

// Search API endpoint
app.get('/search', async (req, res) => {
    try {
        await client.connect();
        const database = client.db("amoebadatabase");
        const collection = database.collection("amoebadata");

        const query = req.query.q;

        let mongoQuery = {};

        // Use the exact organism name from your database
        if (query.includes("Entamoeba Histolytica")) {
            mongoQuery.organism = "Entamoeba Histolytica"; 
        } else if (query.includes("Entamoeba Invadens")) {
            // Note: You must update your database to have this exact organism name
            mongoQuery.organism = "Entamoeba Invadens";
        } else {
            return res.status(400).send("Invalid search query.");
        }

        if (query.includes("Transcriptomics")) {
            // Find documents with the 'transcript_id' field
            mongoQuery.transcript_id = { "$exists": true };
        } else if (query.includes("Protein Sequence")) {
            // Find documents with the 'protein_id' field
            mongoQuery.protein_id = { "$exists": true };
        }

        const results = await collection.find(mongoQuery).toArray();
        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`AmoebaDatabase server listening at http://localhost:${port}`);
});
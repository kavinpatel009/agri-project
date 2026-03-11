// Static data for agriculture implements
const implementsData = [
    {
        id: 1,
        name: "Rotary Tiller",
        category: "tillage",
        price: "$1,200 - $2,500",
        description: "A rotary tiller is a motorized cultivator that works the soil by means of rotating tines or blades.",
        uses: [
            "Soil preparation for planting",
            "Weed control",
            "Mixing compost or fertilizer into soil"
        ],
        image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 2,
        name: "Seed Drill",
        category: "planting",
        price: "$3,000 - $6,000",
        description: "A seed drill is a device that sows seeds for crops by positioning them in the soil and burying them to a specific depth.",
        uses: [
            "Precision planting of seeds",
            "Uniform seed spacing",
            "Reducing seed wastage"
        ],
        image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80"
    },
    {
        id: 3,
        name: "Combine Harvester",
        category: "harvesting",
        price: "$150,000 - $500,000",
        description: "A combine harvester is a machine that harvests grain crops by combining three separate operations: reaping, threshing, and winnowing.",
        uses: [
            "Harvesting crops like wheat, oats, rye",
            "Threshing and cleaning grain",
            "Straw management"
        ],
        image: "https://images.unsplash.com/photo-1598726668148-99946ef1cb42?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 4,
        name: "Drip Irrigation System",
        category: "irrigation",
        price: "$0.10 - $0.50 per square foot",
        description: "Drip irrigation is a type of micro-irrigation system that has the potential to save water and nutrients by allowing water to drip slowly to the roots of plants.",
        uses: [
            "Water conservation",
            "Fertigation (fertilizer application)",
            "Growing crops in arid regions"
        ],
        image: "https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 5,
        name: "Moldboard Plow",
        category: "tillage",
        price: "$500 - $1,500",
        description: "A moldboard plow is a farm tool used to turn over the upper layer of the soil, bringing fresh nutrients to the surface while burying weeds and crop residues.",
        uses: [
            "Primary tillage",
            "Turning over soil",
            "Weed and residue management"
        ],
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    },
    {
        id: 6,
        name: "Transplanter",
        category: "Harvesting Equipment",
        price: "$2,000 - $8,000",
        description: "A rice transplanter is a specialized transplanter fitted to transplant rice seedlings onto paddy fields.",
        uses: [
            "Rice planting",
            "Vegetable seedling transplantation",
            "Labor-saving planting"
        ],
        image: "https://images.unsplash.com/photo-1605001016900-683bca543f3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    }
];

// Function to render implement cards
function renderImplements(implements) {
    const container = document.getElementById('implementsContainer');
    container.innerHTML = '';
    
    if (implements.length === 0) {
        container.innerHTML = '<p class="no-results">No implements found matching your criteria.</p>';
        return;
    }
    
    implements.forEach(implement => {
        const card = document.createElement('div');
        card.className = 'implement-card';
        
        // Format category for display
        const categoryText = implement.category === 'tillage' ? 'Tillage Equipment' :
                            implement.category === 'planting' ? 'Planting Equipment' :
                            implement.category === 'harvesting' ? 'Harvesting Equipment' :
                            'Irrigation Equipment';
        
        card.innerHTML = `
            <div class="card-image">
                <img src="${implement.image}" alt="${implement.name}">
            </div>
            <div class="card-content">
                <span class="category">${categoryText}</span>
                <h3>${implement.name}</h3>
                <div class="price">${implement.price}</div>
                <p class="description">${implement.description}</p>
                <div class="uses">
                    <h4>Primary Uses:</h4>
                    <ul>
                        ${implement.uses.map(use => `<li>${use}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Function to filter implements based on search and category
function filterImplements() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    const filtered = implementsData.filter(implement => {
        const matchesSearch = implement.name.toLowerCase().includes(searchTerm) || 
                             implement.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || implement.category === category;
        return matchesSearch && matchesCategory;
    });
    
    renderImplements(filtered);
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', filterImplements);
document.getElementById('categoryFilter').addEventListener('change', filterImplements);
document.getElementById('searchBtn').addEventListener('click', filterImplements);

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderImplements(implementsData);
});
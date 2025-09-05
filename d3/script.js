document.addEventListener("DOMContentLoaded", function() {
    // Select the container for the D3.js graph
    const container = d3.select("#network-container");
    const width = container.node().getBoundingClientRect().width;
    const height = container.node().getBoundingClientRect().height;

    // Create the SVG element
    const svg = container.append("svg");

    // D3.js Force Simulation
    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Function to populate the table with data
    function populateTable(interactions) {
        const tableBody = d3.select("#interaction-table tbody");
        
        // Group interactions by source
        const groupedData = d3.group(interactions, d => d.source);

        // Iterate through the grouped data to create table rows
        groupedData.forEach((interactions, source) => {
            const targets = interactions.map(d => d.target).join(", ");
            const interactionList = interactions.map(d => d.interaction);
            
            // To ensure interactions are unique and in a list format
            const uniqueInteractions = [...new Set(interactionList)].join(", ");

            const row = tableBody.append("tr");
            row.append("td").text(source);
            row.append("td").text(targets);
            row.append("td").text(uniqueInteractions);
        });
    }

    // Load the JSON data
    d3.json("data.json").then(data => {
        // Filter the data to separate nodes and links
        const nodes = data.nodes.filter(d => d.node_type);
        const links = data.nodes.filter(d => d.source);

        // Update the D3.js simulation with the data
        simulation.nodes(nodes);
        simulation.force("link").links(links);

        // Draw the links
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "link");

        // Draw the nodes
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Add tooltips or labels
        node.append("title")
            .text(d => d.id);

        // Update node and link positions on each simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        // Drag functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        
        // Populate the table using the links data
        populateTable(links);
    }).catch(error => {
        console.error("Error loading the data.json file:", error);
    });
});

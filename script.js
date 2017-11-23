let width = 3000;
let height = 2000;
let marges = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
};

//Initialisation du canevas
let canevas2 = d3.select("body").append("svg")
    .attr("class", "svg")
    .attr("width", width + marges.left + marges.right)
    .attr("height", height + marges.left + marges.right)
    .append("g")
    .attr("transform", "translate(" + marges.left + "," + marges.top + ")");

//On met un petit texte aussi
canevas2.append("g")
    .attr("class", "infoCompteur")
    .attr("transform", "translate(-80, -80)")
    .append("text")
    .attr("id", "texte2");


function selectFichier(fichier) {
    d3.csv(fichier, function(d) {
        return {
            mot1: d.Mot1,
            mot2: d.Mot2,
            poids: +d.Poids
        };
    }, function(dataInit) {

        //Avant toute chose, on trie la base de données en fonction du poids des liens
        dataInit.sort(function(a, b) {
            return b["poids"] - a["poids"];
        });

        //Initialisation du tableau de données et de mots qu'on va utiliser
        let data = [];
        let motsUniques = [];
        let transitionTime = 500;
        let couleurs = ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
        let legende = ["0-15", "15-30", "30-45", "45-60", "60-75", "75-90", "90-100"];

        //Une fonction pour choper les x paires les plus fréquentes
        function selectData(seuil) {
            //On vide le tableau
            data.splice(0);
            //Et on le remplit de nouveau
            for (var i = 0; i < seuil; i++) {
                data[i] = dataInit[i];
            }
        }

        //Une fonction pour choper les mots uniques associés aux x paires les plus fréquentes
        function selectMots(seuil) {
            selectData(seuil);
            //On chope la liste de tous les mots uniques
            var setMotsUniques = new Set();
            data.forEach(function(d) {
                setMotsUniques.add(d.mot1)
                setMotsUniques.add(d.mot2)
            });

            //Et on en fait un tableau
            motsUniques = Array.from(setMotsUniques);
            //Que l'on classe par ordre alphabétique
            //localeCompare c'est pour que ça foire pas avec les accents
            motsUniques.sort((a, b) => a.localeCompare(b));
            return motsUniques;
        }

        //Fonction qui remplit nodes et links bien comme il faut
        function creationTableaux(seuil) {
            var tableauxReseau = [];
            //On chope les mots uniques et le subsest de données (motsUniques et data)
            selectMots(seuil);
            //On passe à travers chaque ligne de data
            tableauxReseau.links = data.map((item) => {
                return {
                    source: item.mot1,
                    target: item.mot2,
                    value: item.poids
                };
            });
            tableauxReseau.nodes = motsUniques.map((item) => {
                return {
                    id: item
                };
            });
            return tableauxReseau;
        }

        function reseau(seuil) {
            var dataNetwork = creationTableaux(seuil);
            console.log(dataNetwork);

            //Avant toute chose, on enlève tout ce qui pourrait rester des simulations précédentes
            canevas2.selectAll(".links").remove();
            canevas2.selectAll(".nodes").remove();
            canevas2.selectAll(".labelnoeuds").remove();

            //Mise à jour du texte
            d3.select("#texte2")
                .text("Top " + seuil + " des liens de " + fichier);

            var simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(d => d.id))
                .force("charge", d3.forceManyBody().strength(-180))
                .force("center", d3.forceCenter(width / 2, height / 2));

            var link = canevas2.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(dataNetwork.links)
                .enter()
                .append("line")
                .attr("stroke", "#DCDCDC")
                .attr("stroke-width", d => 6 * d.value);

            var node = canevas2.append("g")
                .attr("class", "nodes")
                .selectAll("circle")
                .data(dataNetwork.nodes)
                .enter()
                .append("circle")
                .attr("id", d => d.id)
                .attr("r", 5)
                .attr("fill", function(d) {
                    if (d.id === "Seb R." || d.id === "Yannick" || d.id === "Fred B." || d.id === "Hugo" ||
                        d.id === "Nico G." || d.id === "Maxi" || d.id === "Yacine" || d.id === "Mikael" ||
                        d.id === "Damien" || d.id === "Fred" || d.id === "Nico" || d.id === "Yohan" ||
                        d.id === "Hugues" || d.id === "David" || d.id === "Pablo" || d.id === "Bertil" ||
                        d.id === "Robert" || d.id === "Elliot" || d.id === "Daniel" || d.id === "David M." ||
                        d.id === "Jerome" || d.id === "Gael" || d.id === "Greg" || d.id === "Jeff" ||
                        d.id === "Adil" || d.id === "Maxence" || d.id === "Jason" || d.id === "Stoud" ||
                        d.id === "P-A" || d.id === "Mark" || d.id === "Jeremie" || d.id === "Alexandre" ||
                        d.id === "Sélim" || d.id === "Ludo" || d.id === "Jason" || d.id === "Matthieu") return "#ADBCE6";
                    else return "#E6ADD8";
                })
                .attr("stroke", "grey")
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));

            var label = canevas2.selectAll(".labelnoeuds")
                .data(dataNetwork.nodes)
                .enter()
                .append("text")
                .attr("class", "labelnoeuds")
                .text(d => d.id)
                .style("text-anchor", "middle")
                .style("fill", "#555")
                .style("font-family", "Consolas, courier")
                .style("font-size", 9);

            simulation.nodes(dataNetwork.nodes).on("tick", ticked);

            simulation.force("link").links(dataNetwork.links);

            function ticked() {
                link
                    .attr("x1", function(d) {
                        return d.source.x;
                    })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });

                node
                    .attr("cx", function(d) {
                        return d.x;
                    })
                    .attr("cy", function(d) {
                        return d.y;
                    });

                label
                    .attr("x", function(d) {
                        return d.x + 5;
                    })
                    .attr("y", function(d) {
                        return d.y - 10;
                    });

            }

            function dragstarted(d) {
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }

            function dragended(d) {
                if (!d3.event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

        }
        reseau(dataInit.length);
    });
}

selectFichier("liens_whatsapp.csv");
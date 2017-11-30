window.onload = function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
    var tailleBloc = 81.25;
    var width = 650;
    var height = 650;
    var nbBlocsLargeur = width/tailleBloc;
    var nbBlocsHauteur = height/tailleBloc;
    var cases = [];
    var pieces = [];
    
    // affiche le quadrillage et instancie les objets cases
    function afficherFond(){
        var couleur_fond;
        var cpt = 0;
        for (var i = 0; i<nbBlocsHauteur; i++) {
            for (var j = 0; j<nbBlocsLargeur; j++) {
                if (cpt%2 === 0) {
                    couleur_fond = "white";
                    ctx.fillStyle = "white";
                }
                if (cpt%2 === 1){
                    couleur_fond = "black";
                    ctx.fillStyle = "black";
                }
                ctx.fillRect(i*tailleBloc, j*tailleBloc, tailleBloc, tailleBloc);
                cases.push(new carre(couleur_fond, j, i));      
                cpt += 1;
            }
            // On incrémente à nouveau pour créer un quadrillage et pas des lignes (le nombre de cases est pair)
            cpt += 1;
        }
    };
    
    // L'objet case (le mot case n'est pas disponible)
    function carre(couleur, x, y) {
        this.couleur = couleur;
        this.positionX = x;
        this.positionY = y;
        this.couleurEvenement = "";
        this.origineCouleurEvenementX;
        this.origineCouleurEvenementY;
        this.contient = "vide";
        
        this.prendrecouleurEvenement = function(x, y) {
            ctx.fillStyle = this.couleurEvenement;
            ctx.fillRect(x*tailleBloc, y*tailleBloc, tailleBloc, tailleBloc);
        }
    };
    
    function prendrecouleurEvenement(x, y, couleur, origineX, origineY) {
        var i = 0;
        for (i in cases) {
            if (x == cases[i].positionX && y == cases[i].positionY && ((couleur == "red" && cases[i].contient != "vide") || (couleur == "green" && cases[i].contient == "vide"))) {
                cases[i].origineCouleurEvenementX = origineX;
                cases[i].origineCouleurEvenementY = origineY;
                cases[i].couleurEvenement = couleur;
                ctx.fillStyle = cases[i].couleurEvenement;
                ctx.fillRect(x*tailleBloc, y*tailleBloc, tailleBloc, tailleBloc);
            }
        }
    }
    
    function effacerCouleurEvenement() {
        var i = 0;
        for (i in cases) {
            if (cases[i].couleurEvenement != "") {
                cases[i].couleurEvenement = "";
                ctx.fillStyle = cases[i].couleur;
                ctx.fillRect(cases[i].positionX*tailleBloc, cases[i].positionY*tailleBloc, tailleBloc, tailleBloc);
            } 
        }
    }
    
    function actualisationPieces() {
        var i = 0;
        for (i in pieces) {
            if (pieces[i].vivant == true) {
                pieces[i].init();
            }
        }
    }
    
    // L'objet pièce avec x et y en cases pas en pixels
    function piece(nom, x, y) {
        this.nom = nom;
        this.positionX = x;
        this.positionY = y;
        this.vivant = true;
        this.mouvement = [];
        this.attaque = [];
        this.mouvementSpecial = [];
        
        
        this.suppr = function() {
           for (i in cases) {
                if (cases[i].positionX == this.positionX && cases[i].positionY == this.positionY) {
                    cases[i].contient = "vide";
                    ctx.fillStyle = cases[i].couleur;
                    ctx.fillRect(cases[i].positionX*tailleBloc, cases[i].positionY*tailleBloc, tailleBloc, tailleBloc);
                }
            } 
        }
        this.init = function() {
            for (i in cases) {
                if (cases[i].positionX == this.positionX && cases[i].positionY == this.positionY) {
                    dessinerCercle("#FF4422", this.positionX, this.positionY);
                    
                    var myImg = new Image();
                    myImg.onload = function() {
                        ctx.drawImage(myImg, 900, 275, 960, 360, x*tailleBloc, y*tailleBloc, 1000, 300);
                    };
                    myImg.src = 'pieces.png';
                    
                    cases[i].contient = this.nom;
                }
            }  
            if (this.nom == "pion") {
                this.mouvement = [[this.positionX, this.positionY-1]];
                this.attaque = [[this.positionX-1, this.positionY-1], [this.positionX+1, this.positionY-1]];
                this.mouvementSpecial = [[this.positionX, this.positionY-2]];
            }
        }
    }
    
    function dessinerCercle(color, x, y) {
        ctx.beginPath();
        ctx.fillStyle=color;
        ctx.arc(x*tailleBloc+tailleBloc/2, y*tailleBloc+tailleBloc/2, tailleBloc/2.5, 0, 2 * Math.PI);
        ctx.fill();      
    }
    
    // trouver position de la souris relative au canvas
    function trouverPosition(element) {
        var x = y = 0;
        if(element.offsetParent) {
            x = element.offsetLeft;
            y = element.offsetTop;
            while(element = element.offsetParent) {
                x += element.offsetLeft;
                y += element.offsetTop;
            }
        }
        return {'x':x, 'y':y};
    }
    
    afficherFond();
    
    pieces[0] = new piece("pion", 4, 5);
    pieces[0].init();
    
    pieces[1] = new piece("pion", 3, 4);
    pieces[1].init();
    
    pieces[2] = new piece("pion", 2, 4);
    pieces[2].init();
    
    pieces[3] = new piece("pion", 3, 2);
    pieces[3].init();
    
    
    
    
    // Si on clique sur le canvas
    canvas.onclick = function(e) {
        
        console.log(pieces);
        
        // position de la souris dans le canvas en pixel
        var pos = trouverPosition(this);
        var pixelX = e.clientX - pos.x;
        var pixelY = e.clientY - pos.y;
        
        // position de la souris dans le canvas en case
        var x = parseInt(pixelX/tailleBloc);
        var y = parseInt(pixelY/tailleBloc);
        
        // Gère les clics sur les cases (déplacements, attaques...)
        for (i in cases) {
            if (x == cases[i].positionX && y == cases[i].positionY) {
                console.log(cases[i]);
                if (cases[i].couleurEvenement == "") {
                    effacerCouleurEvenement();
                    actualisationPieces();
                } else {
                    for (m in pieces) {
                        if (cases[i].origineCouleurEvenementX == pieces[m].positionX && cases[i].origineCouleurEvenementY == pieces[m].positionY) {
                            
                            // On mange une pièce
                            if (cases[i].contient != "vide" && cases[i].couleurEvenement == "red") {
                                for (n in pieces) {
                                    if (cases[i].positionX == pieces[n].positionX && cases[i].positionY == pieces[n].positionY) {
                                        pieces[n].vivant = false;
                                        pieces[n].suppr();
                                        pieces[n].positionX = null;
                                        pieces[n].positionY = null;
                                        effacerCouleurEvenement();
                                        pieces[n].suppr();
                                    }
                                }
                            }
                            // Déplacement
                            pieces[m].suppr();
                            pieces[m].positionX = x;
                            pieces[m].positionY = y;
                            effacerCouleurEvenement();
                            actualisationPieces();

                            // permet de "déselectionner" la pièce
                            x = null;
                            y = null;
                        }
                    }
                }
            }
        }
        
        // permet de connaître les déplacments possibles d'un pion lorsqu'on clique dessus
        for (k in pieces) {
            if (x == pieces[k].positionX && y == pieces[k].positionY && pieces[k].vivant == true) {
                console.log(pieces[k]);
//                console.log(pieces[i].mouvement);
                for (j in pieces[k].mouvement) {
//                    console.log("X: " + pieces[i].mouvement[j][0]);
//                    console.log("Y: " + pieces[i].mouvement[j][1]);
                    prendrecouleurEvenement(pieces[k].mouvement[j][0], pieces[k].mouvement[j][1], "green", x, y);
                }
                for (l in pieces[k].attaque) {
                    prendrecouleurEvenement(pieces[k].attaque[l][0], pieces[k].attaque[l][1], "red", x, y);
                }
                actualisationPieces();
            }
        }
        
        
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    








}

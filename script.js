window.onload = function () {
    // Mise en place du canvas
	var canvas = document.getElementById('canvas'),
	    ctx = canvas.getContext('2d'),

    //Variables utiles
        tailleBloc = 81.25,
        width = 650,
        height = 650,
        nbBlocsLargeur = width / tailleBloc,
        nbBlocsHauteur = height / tailleBloc,
        cases = [],
        pieces = [],

    // On va chercher l'image et on attend qu'elle charge
        myImg = new Image();
    myImg.src = 'pieces_colores.png';
    
    myImg.onload = function () {

        /* ---#--- FONCTIONS & OBJETS ---#--- */


        // affiche le quadrillage et instancie les objets cases
        function afficherFond() {
            var couleur_fond,
                cpt = 0;
            for (var i = 0; i<nbBlocsHauteur; i++) {
                for (var j = 0; j<nbBlocsLargeur; j++) {
                    if (cpt%2 === 0) {
                        couleur_fond = "white";
                        ctx.fillStyle = "white";
                    }
                    if (cpt%2 === 1){
                        couleur_fond = "grey";
                        ctx.fillStyle = "grey";
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

        // La case en question sera coloré de la couleur adéquat à l'événement (rouge ou vert)
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

        // Permet de supprimer toutes les couleurs d'événement sur le tableau
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

        // Permet de ré-initialiser les pieces (permet de réafficher et d'actualiser les paramètres de déplacment)
        function actualisationPieces() {
            var i = 0;
            for (i in pieces) {
                if (pieces[i].vivant == true) {
                    pieces[i].init();
                }
            }
        }
        
        // Permet de ré-initialiser les cases du jeu
        function actualisationCases() {
            var i = 0;
            for (i in cases) {
                ctx.fillStyle = cases[i].couleur;
                ctx.fillRect(cases[i].positionX*tailleBloc, cases[i].positionY*tailleBloc, tailleBloc, tailleBloc);
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
            this.equipe = nom[0]; // "b" ou "n"


            /* ---#--- METHODES ---#--- */

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

                //Pour dire que la case contient cette pièce
                for (i in cases) {
                    if (cases[i].positionX == this.positionX && cases[i].positionY == this.positionY) {
                        cases[i].contient = this.nom;
                    }
                }

                var x_pion = this.positionX * tailleBloc;
                var y_pion = this.positionY * tailleBloc;

                this.mouvement = [];
                this.attaque = [];
                this.mouvementSpecial = [];


                if (this.nom == "b_pion") {
                    this.mouvement = [[this.positionX, this.positionY-1]];
                    this.attaquesPossibles = [[this.positionX-1, this.positionY-1], [this.positionX+1, this.positionY-1]];
                    
                    for (var i = 0; i<this.attaquesPossibles.length; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.attaquesPossibles[i][0] && cases[j].positionY == this.attaquesPossibles[i][1] && cases[j].contient[0] != this.nom[0]) {
                                this.attaque.push([this.attaquesPossibles[i][0], this.attaquesPossibles[i][1]]);
                            }
                        }
                    }
                    
                    this.mouvementSpecial = [[this.positionX, this.positionY-2]];

                    afficherImg(900, 275, 100, 370, x_pion+17, y_pion+5, 75, 280);
                }
                if (this.nom == "b_tour") {
                    afficherImg(360, 275, 100, 370, x_pion+14.5, y_pion+7, 75, 280);
                 }
                if (this.nom == "b_cavalier") {
                    afficherImg(705, 275, 100, 370, x_pion+4, y_pion+7, 75, 280);
                 }
                if (this.nom == "b_fou") {
                    afficherImg(530, 265, 100, 380, x_pion+7, y_pion+6, 75, 280);
                 }
                if (this.nom == "b_dame") {
                    afficherImg(170, 265, 100, 380, x_pion+3, y_pion+6, 75, 280);
                 }
                if (this.nom == "b_roi") {
                    afficherImg(0, 265, 100, 380, x_pion+8, y_pion+4, 75, 280);
                 }

                if (this.nom == "n_pion") {
                    this.mouvement = [[this.positionX, this.positionY+1]];
                    this.attaquesPossibles = [[this.positionX+1, this.positionY+1], [this.positionX-1, this.positionY+1]];
                    
                    for (var i = 0; i<this.attaquesPossibles.length; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.attaquesPossibles[i][0] && cases[j].positionY == this.attaquesPossibles[i][1] && cases[j].contient[0] != this.nom[0]) {
                                this.attaque.push([this.attaquesPossibles[i][0], this.attaquesPossibles[i][1]]);
                            }
                        }
                    }
                    this.mouvementSpecial = [[this.positionX, this.positionY+2]];

                    afficherImg(900, 125, 100, 100, x_pion+17, y_pion+5, 75, 75);
                }
                if (this.nom == "n_tour") {
                    afficherImg(360, 125, 100, 100, x_pion+14.5, y_pion+7, 75, 75);
                }
                if (this.nom == "n_cavalier") {
                    afficherImg(705, 125, 100, 100, x_pion+4, y_pion+7, 75, 75);
                }
                if (this.nom == "n_fou") {
                    afficherImg(530, 115, 100, 100, x_pion+7, y_pion+6, 75, 75);
                }
                if (this.nom == "n_dame") {
                    afficherImg(170, 115, 100, 100, x_pion+3, y_pion+6, 75, 75);
                }
                if (this.nom == "n_roi") {
                    afficherImg(0, 115, 100, 100, x_pion+8, y_pion+4, 75, 75);
                }

                // Défini les mouvements possibles des tours
                if (this.nom.search("tour") != -1|| this.nom.search("dame") != -1) {

                    var mouv1 = true;
                    var mouv2 = true;
                    var mouv3 = true;
                    var mouv4 = true;

                    for (var i = 1; i <= 8; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.positionX && cases[j].positionY == this.positionY+i && mouv1 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX, this.positionY+i]);
                                } else if (cases[j].contient[0] != this.equipe){
                                    this.attaque.push([this.positionX, this.positionY+i]);
                                    mouv1 = false;
                                } else {
                                    mouv1 = false;
                                }
                            }
                            if (cases[j].positionX == this.positionX && cases[j].positionY == this.positionY-i && mouv2 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX, this.positionY-i]);
                                } else if (cases[j].contient[0] != this.equipe) {
                                    this.attaque.push([this.positionX, this.positionY-i]);
                                    mouv2 = false;
                                } else {
                                    mouv2 = false;
                                }
                            }
                            if (cases[j].positionX == this.positionX+i && cases[j].positionY == this.positionY && mouv3 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX+i, this.positionY]);
                                } else if (cases[j].contient[0] != this.equipe) {
                                    this.attaque.push([this.positionX+i, this.positionY]);
                                    mouv3 = false;
                                } else {
                                    mouv3 = false;
                                }
                            }
                            if (cases[j].positionX == this.positionX-i && cases[j].positionY == this.positionY && mouv4 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX-i, this.positionY]);
                                } else if (cases[j].contient[0] != this.equipe) {
                                    this.attaque.push([this.positionX-i, this.positionY]);
                                    mouv4 = false;
                                } else {
                                    mouv4 = false;
                                }
                            }
                        }
                    }
            //                this.attaque = this.mouvement;
                    this.mouvementSpecial = "le truc avec le roi";
                }
                
                if (this.nom.search("fou") != -1 || this.nom.search("dame") != -1) {

                    var mouv1 = true;
                    var mouv2 = true;
                    var mouv3 = true;
                    var mouv4 = true;

                    for (var i = 1; i <= 8; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.positionX+i && cases[j].positionY == this.positionY+i && mouv1 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX+i, this.positionY+i]);
                                } else if (cases[j].contient[0] != this.equipe){
                                    this.attaque.push([this.positionX+i, this.positionY+i]);
                                    mouv1 = false;
                                } else {
                                    mouv1 = false;
                                }
                            }
                            if (cases[j].positionX == this.positionX+i && cases[j].positionY == this.positionY-i && mouv2 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX+i, this.positionY-i]);
                                } else if (cases[j].contient[0] != this.equipe) {
                                    this.attaque.push([this.positionX+i, this.positionY-i]);
                                    mouv2 = false;
                                } else {
                                    mouv2 = false;
                                }
                            }
                            if (cases[j].positionX == this.positionX-i && cases[j].positionY == this.positionY-i && mouv3 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX-i, this.positionY-i]);
                                } else if (cases[j].contient[0] != this.equipe) {
                                    this.attaque.push([this.positionX-i, this.positionY-i]);
                                    mouv3 = false;
                                } else {
                                    mouv3 = false;
                                }
                            }
                            if (cases[j].positionX == this.positionX-i && cases[j].positionY == this.positionY+i && mouv4 == true) {
                                if (cases[j].contient == "vide") {
                                    this.mouvement.push([this.positionX-i, this.positionY+i]);
                                } else if (cases[j].contient[0] != this.equipe) {
                                    this.attaque.push([this.positionX-i, this.positionY+i]);
                                    mouv4 = false;
                                } else {
                                    mouv4 = false;
                                }
                            }
                        }
                    }
            //                this.attaque = this.mouvement;
                    this.mouvementSpecial = "le truc avec le roi";
                }
                
                
            }

        }

        // Permet d'afficher la portion d'image voulu pour les pieces
        function afficherImg(xImg, yImg, wImg, hImg, xPos, yPos, w, h) {
            ctx.drawImage(myImg, xImg, yImg, wImg, hImg, xPos, yPos, w, h);
        }

        // Permet d'initialiser le plateau (avec les pieces)
        function initPieces(){
            var i =0;

            while (i!=9) {
                pieces.push(new piece("b_pion",i,6));
                i++;
            }
            pieces.push(new piece("b_tour",0,7));
            pieces.push(new piece("b_tour",7,7));
            pieces.push(new piece("b_cavalier",1,7));
            pieces.push(new piece("b_cavalier",6,7));
            pieces.push(new piece("b_fou",2,7));
            pieces.push(new piece("b_fou",5,7));
            pieces.push(new piece("b_dame",3,7));
            pieces.push(new piece("b_roi",4,7));

            i =0;
            while (i!=9) {
                pieces.push(new piece("n_pion",i,1));
                i++;
            }
            pieces.push(new piece("n_tour",0,0));
            pieces.push(new piece("n_tour",7,0));
            pieces.push(new piece("n_cavalier",1,0));
            pieces.push(new piece("n_cavalier",6,0));
            pieces.push(new piece("n_fou",2,0));
            pieces.push(new piece("n_fou",5,0));
            pieces.push(new piece("n_dame",3,0));
            pieces.push(new piece("n_roi",4,0));

            actualisationPieces();
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


        /* ---#--- MAIN ---#--- */

        // On initialise le Jeu
        afficherFond();
        initPieces();

        // Si on clique sur le canvas
        canvas.onclick = function(e) {

            console.log(pieces);
            
            //atualisation pour empecher la pixellisation
            actualisationCases();
            actualisationPieces();

            // position de la souris dans le canvas en pixel
            var pos = trouverPosition(this);
            var pixelX = e.clientX - pos.x;
            var pixelY = e.clientY - pos.y;
            // position de la souris dans le canvas en case
            var x = parseInt(pixelX/tailleBloc);
            var y = parseInt(pixelY/tailleBloc);


            // Gère les clics sur les cases (déplacements, attaques...)
            for (var i in cases) {
                if (x == cases[i].positionX && y == cases[i].positionY) {
                    console.log(cases[i]);

                    // Si il n'y a pas une couleur sur la case (vert ou rouge)
                    if (cases[i].couleurEvenement == "") {
                        effacerCouleurEvenement();
                        actualisationPieces();

                    // Si il y a une couleur d'événement
                    } else {
                        for (var m in pieces) {
                            if (cases[i].origineCouleurEvenementX == pieces[m].positionX && cases[i].origineCouleurEvenementY == pieces[m].positionY) {

                                // On mange une pièce
                                if (cases[i].contient != "vide" && cases[i].couleurEvenement == "red") {
                                    for (var n in pieces) {
                                        if (cases[i].positionX == pieces[n].positionX && cases[i].positionY == pieces[n].positionY) {
                                            pieces[n].vivant = false;
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
            for (var k in pieces) {
                if (x == pieces[k].positionX && y == pieces[k].positionY && pieces[k].vivant == true) {
                    console.log(pieces[k]);
    //                console.log(pieces[i].mouvement);
                    for (var j in pieces[k].mouvement) {
    //                    console.log("X: " + pieces[i].mouvement[j][0]);
    //                    console.log("Y: " + pieces[i].mouvement[j][1]);
                        prendrecouleurEvenement(pieces[k].mouvement[j][0], pieces[k].mouvement[j][1], "green", x, y);
                    }
                    for (var l in pieces[k].attaque) {
                        prendrecouleurEvenement(pieces[k].attaque[l][0], pieces[k].attaque[l][1], "red", x, y);
                    }
                    actualisationPieces();
                }
            }


        }

    };
}

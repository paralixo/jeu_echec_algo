window.onload = function () {
    // Mise en place du canvas
	var canvas = document.getElementById('canvas'),
	    ctx = canvas.getContext('2d'),

	 		poub_gauche = document.getElementById('poub_gauche'),
			ctx_poub_gauche = poubelle_gauche.getContext('2d'),

			poub_droite = document.getElementById('poub_droite'),
			ctx_poub_droite = poubelle_droite.getContext('2d'),

    //Variables globales
        tailleBloc = 81.25,
        width = 650,
        height = 650,
        nbBlocsLargeur = width / tailleBloc,
        nbBlocsHauteur = height / tailleBloc,
        // Tableau d'objets contenant les cases du jeu
        cases = [],
        // Tableau d'objets contenant les pieces du jeu
        pieces = [],
        // Si le Roi est en echec
        echecBlanc = false,
        // En cas d'echec on ne peut pas jouer toutes les pieces
        piecesJouables = [],
        // Pour connaitre le tour (j1 ou j2) et modifier la rotation du plateau en conséquence
        cpt = 0 ,
        tour ,
        posPlateau = 0,

        rotationPlateau = false,
		// On va chercher l'image et on attend qu'elle charge
        myImg = new Image();
    myImg.src = 'pieces_colores.png';

    $('#j1').hide();
    $('#j2').hide();
    $('#echecBlanc').hide();
    $('#echecNoir').hide();
    $('#matBlanc').hide();
    $('#matNoir').hide();


    myImg.onload = function () {

        /* ---#--- FONCTIONS & OBJETS ---#--- */

        // Si on decide d'activer le mode rotation ou de le désactiver (le boutton)
        $("#changerModeRotation").click(function(){
            if (rotationPlateau == false) {
                rotationPlateau = true;
                $("#changerModeRotation").text("Mode : rotation")
            } else {
                rotationPlateau = false;
                $("#changerModeRotation").text("Mode : sans rotation")
            }
        })

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
                //if (pieces[i].vivant == true) {
                    pieces[i].init();
                //}
            }
        }

        // Permet de ré-initialiser les cases du jeu
        function actualisationCases() {
            var i = 0;
            for (i in cases) {
                ctx.fillStyle = cases[i].couleur;
                ctx.fillRect(cases[i].positionX*tailleBloc, cases[i].positionY*tailleBloc, tailleBloc, tailleBloc);
            }
            ctx_poub_gauche.fillStyle = 'white';
            ctx_poub_droite.fillStyle = 'white';
            ctx_poub_gauche.fillRect(0, 0, tailleBloc, height);
            ctx_poub_droite.fillRect(0, 0, tailleBloc, height);
        }

        // L'objet pièce avec x et y en cases pas en pixels
        function piece(nom, x, y, id) {
            this.id = id;
            this.nom = nom;
            this.positionX = x;
            this.positionY = y;
            this.vivant = true;
            this.mouvement = [];
            this.attaque = [];
            this.mouvementSpecial = [];
            this.equipe = nom[0]; // "b" ou "n"
            this.aBouge = false;


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


                if (this.nom == "b_pion") {
                    this.mouvement = [[this.positionX, this.positionY-1]];
                    this.attaquesPossibles = [[this.positionX-1, this.positionY-1], [this.positionX+1, this.positionY-1]];

                    this.mouvementSpecial = [this.positionX, this.positionY-2];
                    if (this.aBouge == false) {
                        this.mouvement.push(this.mouvementSpecial);
                    } else {
                        this.mouvement[1] = [99,99];
                    }

                    for (var i = 0; i<this.attaquesPossibles.length; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.attaquesPossibles[i][0] && cases[j].positionY == this.attaquesPossibles[i][1] && cases[j].contient[0] != this.nom[0]) {
                                this.attaque.push([this.attaquesPossibles[i][0], this.attaquesPossibles[i][1]]);

														}
                        }
                    }


                    afficherImg(900, 275, 100, 370, x_pion+17, y_pion+5, 75, 280);
										if (this.vivant==false){
											ctx_poub_gauche.drawImage(myImg, 900, 275, 100, 370, 17, 406.25, 75, 280);
											}
								}
                if (this.nom == "b_tour") {
									afficherImg(360, 275, 100, 370, x_pion+14.5, y_pion+7, 75, 280);
									if (this.vivant==false){
										ctx_poub_gauche.drawImage(myImg, 360, 275, 100, 370, 13, 81.25, 75, 280);

									}
								 }
                if (this.nom == "b_cavalier") {
                    afficherImg(705, 275, 100, 370, x_pion+4, y_pion+7, 75, 280);
										if (this.vivant==false){
											ctx_poub_gauche.drawImage(myImg, 705, 275, 100, 370, 4, 162.5, 75, 280);

										}
								 }
                if (this.nom == "b_fou") {
                    afficherImg(530, 265, 100, 380, x_pion+7, y_pion+6, 75, 280);
										if (this.vivant==false){
											ctx_poub_gauche.drawImage(myImg, 530, 265, 100, 380, 7, 243.75, 75, 280);
											}
								 }
                if (this.nom == "b_dame") {
                    afficherImg(170, 265, 100, 380, x_pion+3, y_pion+6, 75, 280);
										if (this.vivant==false){
											ctx_poub_gauche.drawImage(myImg, 170, 265, 100, 380, 7, 325, 75, 280);
											}
								 }
                if (this.nom == "b_roi") {
                    this.mouvementsPossibles = [[this.positionX-1, this.positionY-1], [this.positionX, this.positionY-1], [this.positionX+1, this.positionY-1], [this.positionX-1, this.positionY], [this.positionX+1, this.positionY], [this.positionX-1, this.positionY+1], [this.positionX+1, this.positionY+1], [this.positionX, this.positionY+1]];

                    for (var i = 0; i<this.mouvementsPossibles.length; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.mouvementsPossibles[i][0] && cases[j].positionY == this.mouvementsPossibles[i][1] && cases[j].contient[0] != this.nom[0]) {
                                this.attaque.push([this.mouvementsPossibles[i][0], this.mouvementsPossibles[i][1]]);
                            } else if (cases[j].contient == "vide") {
                                this.mouvement.push([this.mouvementsPossibles[i][0], this.mouvementsPossibles[i][1]]);
                            }
                        }
                    }

                    afficherImg(0, 265, 100, 380, x_pion+8, y_pion+4, 75, 280);

								 }

                if (this.nom == "n_pion") {
                    this.mouvement = [[this.positionX, this.positionY+1]];
                    this.attaquesPossibles = [[this.positionX+1, this.positionY+1], [this.positionX-1, this.positionY+1]];

                    this.mouvementSpecial = [this.positionX, this.positionY+2];
                    if (this.aBouge == false) {
                        this.mouvement.push(this.mouvementSpecial);
                    } else {
                        this.mouvement[1] = [99,99];
                    }

                    for (var i = 0; i<this.attaquesPossibles.length; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.attaquesPossibles[i][0] && cases[j].positionY == this.attaquesPossibles[i][1] && cases[j].contient[0] != this.nom[0]) {
                                this.attaque.push([this.attaquesPossibles[i][0], this.attaquesPossibles[i][1]]);
                            }
                        }
                    }


                    afficherImg(900, 125, 100, 100, x_pion+17, y_pion+5, 75, 75);
										if (this.vivant==false){
											ctx_poub_droite.drawImage(myImg, 900, 125, 100, 100, 17, 406.25, 75, 75);
											}
								}
                if (this.nom == "n_tour") {
                    afficherImg(360, 125, 100, 100, x_pion+14.5, y_pion+7, 75, 75);
										if (this.vivant==false){
											ctx_poub_droite.drawImage(myImg, 360, 125, 100, 100, 14.5, 81.25, 75, 75);

										}
								}
                if (this.nom == "n_cavalier") {
                    afficherImg(705, 125, 100, 100, x_pion+4, y_pion+7, 75, 75);
										if (this.vivant==false){
											ctx_poub_droite.drawImage(myImg, 705, 125, 100, 100, 4, 162.5, 75, 75);

										}
								}
                if (this.nom == "n_fou") {
                    afficherImg(530, 115, 100, 100, x_pion+7, y_pion+6, 75, 75);
										if (this.vivant==false){
											ctx_poub_droite.drawImage(myImg, 530, 115, 100, 100, 7, 243.75, 75, 75);
											}
								}
                if (this.nom == "n_dame") {
                    afficherImg(170, 115, 100, 100, x_pion+3, y_pion+6, 75, 75);
										if (this.vivant==false){
											ctx_poub_droite.drawImage(myImg, 170, 115, 100, 100, 7, 325, 75, 75);
											}
								}
                if (this.nom == "n_roi") {
                    this.mouvementsPossibles = [[this.positionX-1, this.positionY-1], [this.positionX, this.positionY-1], [this.positionX+1, this.positionY-1], [this.positionX-1, this.positionY], [this.positionX+1, this.positionY], [this.positionX-1, this.positionY+1], [this.positionX+1, this.positionY+1], [this.positionX, this.positionY+1]];

                    for (var i = 0; i<this.mouvementsPossibles.length; i++) {
                        for (var j in cases) {
                            if (cases[j].positionX == this.mouvementsPossibles[i][0] && cases[j].positionY == this.mouvementsPossibles[i][1] && cases[j].contient[0] != this.nom[0]) {
                                this.attaque.push([this.mouvementsPossibles[i][0], this.mouvementsPossibles[i][1]]);
                            } else if (cases[j].contient == "vide") {
                                this.mouvement.push([this.mouvementsPossibles[i][0], this.mouvementsPossibles[i][1]]);
                            }
                        }
                    }

                    afficherImg(0, 115, 100, 100, x_pion+8, y_pion+4, 75, 75);
                }

                // Défini les mouvements possibles des tours et de la reine
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
                    this.mouvementSpecial = "le roque";
                }

                // Défini les mouvements du cavalier
                if (this.nom.search("cavalier") != -1) {
                    this.mouvementsPossibles = [[this.positionX+1 , this.positionY-2 ],[this.positionX-1 , this.positionY-2],[this.positionX+2 , this.positionY+1],[this.positionX+2 , this.positionY-1],[this.positionX-2 , this.positionY+1],[this.positionX-2 , this.positionY-1],[this.positionX+1 , this.positionY+2],[this.positionX-1 , this.positionY+2]]

                        for (var i = 0; i<this.mouvementsPossibles.length; i++) {
                            for (var j in cases) {
                                    if (cases[j].positionX == this.mouvementsPossibles[i][0] && cases[j].positionY == this.mouvementsPossibles[i][1] && cases[j].contient[0] != this.nom[0]) {
                                            this.attaque.push([this.mouvementsPossibles[i][0], this.mouvementsPossibles[i][1]]);
                                    } else if (cases[j].contient == "vide") {
                                            this.mouvement.push([this.mouvementsPossibles[i][0], this.mouvementsPossibles[i][1]]);
                                    }
                            }
                    }
                }

                // Défini les mouvements du fou et de la reine
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
                this.mouvementSpecial = "le roque";
            }


            }

        }

        // Permet d'afficher la portion d'image voulu pour les pieces
        function afficherImg(xImg, yImg, wImg, hImg, xPos, yPos, w, h) {
            ctx.drawImage(myImg, xImg, yImg, wImg, hImg, xPos, yPos, w, h);
        }

        // Permet d'initialiser le plateau (les pieces)
        function initPieces(){
            var i =0;

            while (i!=9) {
                pieces.push(new piece("b_pion",i,6,i));
                i++;
            }
            pieces.push(new piece("b_tour",0,7,8));
            pieces.push(new piece("b_tour",7,7,9));
            pieces.push(new piece("b_cavalier",1,7,10));
            pieces.push(new piece("b_cavalier",6,7,11));
            pieces.push(new piece("b_fou",2,7,12));
            pieces.push(new piece("b_fou",5,7,13));
            pieces.push(new piece("b_dame",3,7,14));
            pieces.push(new piece("b_roi",4,7,15));

            i =0;
            while (i!=9) {
                pieces.push(new piece("n_pion",i,1,16+i));
                i++;
            }
            pieces.push(new piece("n_tour",0,0,24));
            pieces.push(new piece("n_tour",7,0,25));
            pieces.push(new piece("n_cavalier",1,0,26));
            pieces.push(new piece("n_cavalier",6,0,27));
            pieces.push(new piece("n_fou",2,0,28));
            pieces.push(new piece("n_fou",5,0,29));
            pieces.push(new piece("n_dame",3,0,30));
            pieces.push(new piece("n_roi",4,0,31));

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

        function verifVictoire(){
            var roiBlancDeplacements = [];
            var roiBlancAttaques = [];
            var victoireBlanc = [];
            var reussiteBlanc = true;
            
            // Mets en mémoire tout les déplacements/attaques de l'équipe adverse et du roi concerné
            for (var i in pieces) {
                // Pour determiner l'échec
                if (pieces[i].nom[0] == "n") {
                    for (var j in pieces[i].attaque) {
                        roiBlancAttaques.push(pieces[i].attaque[j])
                    }
                }
                // Pour avoir les coordonnées autour du roi
                if (pieces[i].nom == "b_roi") {
                    for (var j in pieces[i].mouvementsPossibles) {
                        roiBlancDeplacements.push(pieces[i].mouvementsPossibles[j]);
                    }
                }
            }
            
            // Permet de déterminer si le Roi est en échec ou pas
            for (var i in pieces) {
                if (pieces[i].nom == "b_roi") {
                    for (var j in roiBlancAttaques) {
                        if (roiBlancAttaques[j][0] == pieces[i].positionX && roiBlancAttaques[j][1] == pieces[i].positionY) {
                            console.log("Echec des Blancs");

                            echecBlanc = true;
                        }
                    }
                }
            }
            
            // Vérifie chaque case autour du roi pour déterminer le mat ou pas
            for (var j in roiBlancDeplacements) {
                for (var k in pieces) {
                    if (pieces[k].nom[0] == "n") {
                        for (var l in pieces[k].mouvement) {
                            // Si un ennemi peut attaquer les cases voisines au roi
                            if (roiBlancDeplacements[j][0] == pieces[k].mouvement[l][0] && roiBlancDeplacements[j][1] == pieces[k].mouvement[l][1]) {
                                victoireBlanc[j] = 1;
                                console.log("Piece attaquant le roi blanc: ")
                                console.log(pieces[k].nom);
                                
                                verifCase(pieces[k].nom);
                            // Si il y a une piece autour
                            } else {
                                for (var m in cases) {
                                    if (roiBlancDeplacements[j][0] == cases[m].positionX && roiBlancDeplacements[j][1] == cases[m].positionY) {
                                        if (cases[m].contient != "vide") {
                                            victoireBlanc[j] = 1;
                                        }
                                    }
                                }
                            }
                            if (victoireBlanc[j] != 1) {
                                victoireBlanc[j] = 0;
                            }
                        }
                    }   
                }
            }
            
            
            
            for (var i in victoireBlanc) {
                if (victoireBlanc[i] == 0) {
                    reussiteBlanc = false;
                }
            }
            if (reussiteBlanc == true && echecBlanc == true) {
                console.log("Echec et mat des Blancs");
                $('#matBlanc').fadeIn();
                $('#matBlanc').fadeOut();
            } else if (echecBlanc == true) {
                $('#echecBlanc').fadeIn();
                $('#echecBlanc').fadeOut();
            }
            
            console.log("-------------------------------")
            console.log("Cases autour du Roi blanc: ")
            console.log(victoireBlanc);
            console.log(piecesJouables);
            
            
            /* Roi Noir, pas le temps de faire une seul
            fonction pour les deux */
            
            
            var roiNoirDeplacements = [];
            var roiNoirAttaques = [];
            var victoireNoir = [];
            var reussiteNoir = true;
            
            // Mets en mémoire tout les déplacements/attaques de l'équipe adverse et du roi concerné
            for (var i in pieces) {
                // Pour determiner l'échec
                if (pieces[i].nom[0] == "b") {
                    for (var j in pieces[i].attaque) {
                        roiNoirAttaques.push(pieces[i].attaque[j])
                    }
                }
                // Pour avoir les coordonnées autour du roi
                if (pieces[i].nom == "n_roi") {
                    for (var j in pieces[i].mouvementsPossibles) {
                        roiNoirDeplacements.push(pieces[i].mouvementsPossibles[j]);
                    }
                }
            }
            
            // Permet de déterminer si le Roi est en échec ou pas
            for (var i in pieces) {
                if (pieces[i].nom == "n_roi") {
                    for (var j in roiNoirAttaques) {
                        if (roiNoirAttaques[j][0] == pieces[i].positionX && roiNoirAttaques[j][1] == pieces[i].positionY) {
                            console.log("Echec des Noirs");
                            
                            echecNoir = true;
                        }
                    }
                }
            }
            
            // Vérifie chaque case autour du roi pour déterminer le mat ou pas
            for (var j in roiNoirDeplacements) {
                for (var k in pieces) {
                    if (pieces[k].nom[0] == "b") {
                        for (var l in pieces[k].mouvement) {
                            // Si un ennemi peut attaquer les cases voisines au roi
                            if (roiNoirDeplacements[j][0] == pieces[k].mouvement[l][0] && roiNoirDeplacements[j][1] == pieces[k].mouvement[l][1]) {
                                victoireNoir[j] = 1;
                                console.log("Piece attaquant le roi Noir: ")
                                console.log(pieces[k].nom);
                                
                                verifCase(pieces[k].nom);
                            // Si il y a une piece autour
                            } else {
                                for (var m in cases) {
                                    if (roiNoirDeplacements[j][0] == cases[m].positionX && roiNoirDeplacements[j][1] == cases[m].positionY) {
                                        if (cases[m].contient != "vide") {
                                            victoireNoir[j] = 1;
                                        }
                                    }
                                }
                            }
                            if (victoireNoir[j] != 1) {
                                victoireNoir[j] = 0;
                            }
                        }
                    }   
                }
            }
            
            
            
            for (var i in victoireNoir) {
                if (victoireNoir[i] == 0) {
                    reussiteNoir = false;
                }
            }
            if (reussiteNoir == true && echecNoir == true) {
                console.log("Echec et mat des Noirs");
                $('#matNoir').fadeIn();
                $('#matNoir').fadeOut();
            } else if (echecNoir == true) {
                $('#echecNoir').fadeIn();
                $('#echecNoir').fadeOut();
            }
            
            console.log("-------------------------------")
            console.log("Cases autour du Roi noir: ")
            console.log(victoireNoir);
            console.log(piecesJouables);
        }
        
        // Permet de verifier la case ou se trouve l'attaquant dans la verification de la victoire
        function verifCase(nomPiece) {
            var attaquesPossibles = [];
            var attaquant = [];
            var rslt = [];
            
            for (var i in pieces) {
                for (var j in pieces[i].attaque) {
                    attaquesPossibles.push(pieces[i].attaque[j])
                    attaquant.push(pieces[i].id)
                } 
            }
            
            for (var i in pieces) {
                if (pieces[i].nom == nomPiece) {
                    for (var j in attaquesPossibles) {
                        if (attaquesPossibles[j][0] == pieces[i].positionX && attaquesPossibles[j][1] == pieces[i].positionY) {
                            console.log("Personne pouvant attaquer " + nomPiece);
                            console.log(attaquant[j]);
                            rslt.push(attaquant[j])
                        }
                    }
                }
                
                if (pieces[i].nom == "b_roi") {
                    rslt.push(pieces[i].id)
                }
            }
            
            piecesJouables = rslt; 
        }


        /* ---#--- MAIN ---#--- */

        // On initialise le Jeu
        afficherFond();
        initPieces();

        // Si on clique sur le canvas
        canvas.onclick = function(e) {

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

            if (cpt%2 != 0 && rotationPlateau == true){
                x = nbBlocsLargeur - x - 1;
                y = nbBlocsHauteur - y - 1;
            }


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
                                            pieces[n].positionX = 9999; // Pblm d'affichage lors de la mort avec la valeur null
                                            pieces[n].positionY = 9999;
                                            effacerCouleurEvenement();
                                            pieces[n].suppr();
                                        }
                                    }
                                }

                                // Déplacement
                                pieces[m].suppr();
                                pieces[m].positionX = x;
                                pieces[m].positionY = y;
                                pieces[m].aBouge = true;
                                effacerCouleurEvenement();
                                actualisationPieces();

                                // permet de "déselectionner" la pièce
                                x = null;
                                y = null;

								cpt++;
                                if (cpt%2 == 0){
                                    $('#j1').fadeIn('slow');
                                    $('#j1').fadeOut('slow');
                                    if (rotationPlateau == true) {
                                        canvas.className= "derotation";
                                    } 
                                } else {
                                    $('#j2').fadeIn('slow');
                                    $('#j2').fadeOut('slow');
                                    if (rotationPlateau == true) {
                                        canvas.className= "rotation";
                                    }
                                }
                                
                            }
                        }
                    }
                }
            }

            // Connaitre le tour de jeu
            if (cpt%2 == 0){
                tour = "b";
            } else {
                tour = "n";
            }
            
            // permet de connaître les déplacments possibles d'un pion lorsqu'on clique dessus
            for (var k in pieces) {
                if (echecBlanc == false || tour == "n") {
                    if (x == pieces[k].positionX && y == pieces[k].positionY && pieces[k].vivant == true && pieces[k].equipe == tour) {
                        console.log(pieces[k]);
                        for (var j in pieces[k].mouvement) {
                            prendrecouleurEvenement(pieces[k].mouvement[j][0], pieces[k].mouvement[j][1], "green", x, y);
                        }
                        for (var l in pieces[k].attaque) {
                            prendrecouleurEvenement(pieces[k].attaque[l][0], pieces[k].attaque[l][1], "red", x, y);
                        }
                        actualisationPieces();
                    }
                } else {
                   for (var i in piecesJouables) {
                       if (piecesJouables[i] == pieces[k].id) {
                            if (x == pieces[k].positionX && y == pieces[k].positionY && pieces[k].vivant == true && pieces[k].equipe == tour) {
                                console.log(pieces[k]);
                                for (var j in pieces[k].mouvement) {
                                    prendrecouleurEvenement(pieces[k].mouvement[j][0], pieces[k].mouvement[j][1], "green", x, y);
                                }
                                for (var l in pieces[k].attaque) {
                                    prendrecouleurEvenement(pieces[k].attaque[l][0], pieces[k].attaque[l][1], "red", x, y);
                                }
                                actualisationPieces();
                            }
                       }
                   }
                }
            }

            
            verifVictoire();
        }

    };
}
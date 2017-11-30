# jeu_echec_algo
Le jeu d'échec à faire en projet en cours d'algo




if (this.nom == "pion") {
    this.mouvement = [[this.positionX, this.positionY-1]];
    this.attaque = [[this.positionX-1, this.positionY-1], [this.positionX+1, this.positionY-1]];
    this.mouvementSpecial = [[this.positionX, this.positionY-2]];
}

if (this.nom == "tour") {
    for (var i = 0; i < 8; i++) {
        
        for (var j in cases) {
            if (cases[j].positionX == this.positionX && cases[j].positionY == this.positionY+i) {
                if (cases[j].contient == "vide") {
                    this.mouvement.push([this.positionX, this.positionY+i]);
                } else {
                    this.attaque.push([this.positionX, this.positionY+i]);
                    fin = true;
                }
            }
        }
        if (fin == true) { break; }
    }
    
    for (var i = 0; i < 8; i++) {
        
        for (var j in cases) {
            if (cases[j].positionX == this.positionX && cases[j].positionY == this.positionY-i) {
                if (cases[j].contient == "vide") {
                    this.mouvement.push([this.positionX, this.positionY-i]);
                } else {
                    this.attaque.push([this.positionX, this.positionY-i]);
                    break;
                }
            }
        }
        if (fin == true) { break; }
    }
    
    
    for (var i = 0; i < 8; i++) {
        for (var j in cases) {
            if (cases[j].positionX == this.positionX+i && cases[j].positionY == this.positionY) {
                if (cases[j].contient == "vide") {
                    this.mouvement.push([this.positionX+i, this.positionY]);
                } else {
                    this.attaque.push([this.positionX+i, this.positionY]);
                    break;
                }
            }
        }
        if (fin == true) { break; }
    }
    
    for (var i = 0; i < 8; i++) {
        
        for (var j in cases) {
            if (cases[j].positionX == this.positionX-i && cases[j].positionY == this.positionY) {
                if (cases[j].contient == "vide") {
                    this.mouvement.push([this.positionX-i, this.positionY]);
                } else {
                    this.attaque.push([this.positionX-i, this.positionY]);
                    break;
                }
            }
        }
        
    }

    this.mouvementSpecial = "le truc avec le roi";
}





if (this.nom == "fou") {
    this.mouvement = [];
    this.attaque = [];
    this.mouvementSpecial = [];
}

if (this.nom == "cavalier") {
    this.mouvement = [];
    this.attaque = [];
    this.mouvementSpecial = [];
}

if (this.nom == "roi") {
    this.mouvement = [];
    this.attaque = [];
    this.mouvementSpecial = [];
}

if (this.nom == "reine") {
    this.mouvement = [];
    this.attaque = [];
    this.mouvementSpecial = [];
}





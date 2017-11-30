var fin = false;
var cpt = 0
var x = nb_aleatoire(0, 100);
alert(x);

while (fin === false) {
    var nb = prompt("Choisissez un nombre entre 0 et 100 :");
    cpt += 1;
    if (nb < x) {
        alert("Plus grand !");
    }
    if (nb > x) {
        alert("Plus petit !");
    }
    if (nb == x) {
        alert("Tu as gagné en seulement " + cpt + " coups");
        fin = true;
    }
}

function nb_aleatoire(min, max) {
    var nb = min + (max-min+1)*Math.random();
    return Math.floor(nb);
}


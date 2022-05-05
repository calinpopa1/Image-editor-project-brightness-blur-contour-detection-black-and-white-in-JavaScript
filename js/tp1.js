/* Auteurs: Calin Popa (20158726), Félix Pigeon (20153060)
	
Ce fichier contient différentes fonctionnalités pour modifier une image :
    - noitEtBlanc(img) : transforme l'image en noir et blanc
    - correctionClarte(img, quantite) : augment ou dimiue (selon le signe de quantite) la clarté de l'image
    - flou(img, taille) : applique un flou à l'image de la taille spécifiée
    - detectionContour(img) : transforme l'image en un masque des contours de l'image

Pour faire ces opérations, les fonctions suivantes sont utilisées :
	- luminance : calcul la valeur de gris d'un pixel (pour image en noir et blanc)
    - modifierClarte : modifie la clarté d'un pixel, selon la quantité donnée
    - extractionVoisinage(taille) : extraie les pixel dans la région
    				centrée selon le centre donné et de la taille 'taille'.
    - appliquerFiltre : applique le filtre à l'image fournie en multipliant chaque couleur
    				de chaque pixel (i,j)  par l'élément correspondant (i,j) dans le filtre.
    - pixel2Str : Convertie le registre d'un pixel (r,g,b) en chaine de caractère pour le comparer
    				à d'autres pixel
    - imageEgales : Vérifie si 2 images sont égales en comparent les chaines de caractères des pixels
    				des 2 images.
 */


function noirEtBlanc(imageOriginale) {
	// Cette fonction transforme l'image originale en noir et blanc.
	var nouvelleImage=Array(imageOriginale.length);
    
	for(var i=0;i<=imageOriginale.length-1;i++){
		nouvelleImage[i]=Array();
		for(var j=0;j<=imageOriginale[i].length-1;j++){
			var lumi=luminance(imageOriginale[i][j]);
			nouvelleImage[i].push({r:lumi,g:lumi,b:lumi});
		}
	}
	return nouvelleImage;
}

function luminance(pixel){
    // Cette fonction calcul la luminance d'un pixel (noir et blanc)
	return Math.round(0.2126*pixel.r+0.7152*pixel.g+0.0722*pixel.b);
}



function correctionClarte(imageOriginale, quantite) {
	// Cette fonction modifie la clarté de image originale par la valeur quantite.
	var nouvelleImage=Array(imageOriginale.length);
    
	for(var i=0;i<=imageOriginale.length-1;i++){
		nouvelleImage[i]=Array();
		for(var j=0;j<=imageOriginale[i].length-1;j++){
			var pixel=modifierClarte(imageOriginale[i][j], quantite);
			nouvelleImage[i].push(pixel);
		}
	}
	return nouvelleImage;
}

function modifierClarte(pixel, quantite) {
    // Cette fonction modifie la clarté d'un pixel
    pixel.r = Math.min(255, Math.round(Math.pow(pixel.r/255, quantite)*255));
    pixel.g = Math.min(255, Math.round(Math.pow(pixel.g/255, quantite)*255));
    pixel.b = Math.min(255, Math.round(Math.pow(pixel.b/255, quantite)*255));
    
    return pixel;
}


function flou(imageOriginale, taille) {
	// Cette fonction ajoutte un flou à l'image originale.
    // L'intensité du flou est déterminé par le paramètre taille
	var nouvelleImage=Array(imageOriginale.length);
    
    // Filtre pour le flou
    var filtre = Array(taille);
    for (var i = 0; i < taille; i++) {
 		filtre[i] = Array(taille);
   		for (var j = 0; j < taille; j++) {
               filtre[i][j] = 1 / (taille * taille);
        }
    }
    
    // Extraction du voisinage et application du filtre
	for(var i=0;i<=imageOriginale.length-1;i++){
		nouvelleImage[i]=Array();
		for(var j=0;j<=imageOriginale[i].length-1;j++){
            var voinsins = extractionVoisinage(imageOriginale, {x:i, y:j}, taille);
			var pixel = appliquerFiltre(voinsins, filtre);
			nouvelleImage[i].push(pixel);
		}
	}
	return nouvelleImage;
}

function detectionContours(imageOriginale) {
    // Cette détecte les contours de l'image en appliquand deux filtres
    // à l'image transformée en noir et blanc.
    var imageNoirBlanc = noirEtBlanc(imageOriginale);
    var nouvelleImage=Array(imageOriginale.length);
    
    // Filtres
    var pondX = [[-1,0,1], [-2,0,2], [-1,0,1]];
    var pondY = [[-1,-2,-1], [0,0,0], [1,2,1]];
    
    // Extraction du voisinage et application du filtre
    for(var i=0;i<=imageOriginale.length-1;i++){
        nouvelleImage[i]=Array();
        for(var j=0;j<=imageOriginale[i].length-1;j++){
            var voinsins = extractionVoisinage(imageOriginale, {x:i, y:j}, 3);            
            var varX = appliquerFiltre(voinsins, pondX).r;
            var varY = appliquerFiltre(voinsins, pondY).r;
            
            var intensiteC = Math.min(255, Math.max(Math.abs(varX), Math.abs(varY)));
            nouvelleImage[i].push({r:intensiteC, g:intensiteC, b:intensiteC});
        }
    }
    return nouvelleImage;
}


function extractionVoisinage(image, centre, taille) {
    // Cette fonction extrait le voisinage centré au point centre
    // de taille 'taille' de l'image et retourne ce voisinage
    
    var xDim = image.length; //Dimensions de l'image pour vérifier
    var yDim = image[0].length; // si on sort du cadre
    
    
    // Détermination de l'origine du voisinage
    var xO = centre.x - Math.floor(taille/2);
    var yO = centre.y - Math.floor(taille/2);
    
    // Extraction du voisinage
    var x = xO;
    var y = yO;
    var voisinage = Array();
    while (x < xO + taille) {
        y = yO;
        var vec = Array();
        while (y < yO + taille) {
            // On vérifie si on est dans le cadre de l'image...
            if (x >= 0 && y >= 0 && x < xDim && y < yDim) {
                vec.push(image[x][y]);
            }
            else { // ... sinon on place un pixel noir.
                vec.push({r:0, g:0, b:0});
            }
            y++;
        }
        voisinage.push(vec);
        x++;
    }
    return voisinage;
}

function appliquerFiltre(img, filtre) {
    // Fonction qui applique le filtre à l'image fournie.
    // Img et filtre sont multipliés éléments par éléments
    var pixelFiltre = {r:0, g:0, b:0};
    
    for(var i=0;i<=img.length-1;i++){
        for(var j=0;j<=img[i].length-1;j++){
            pixelFiltre.r += img[i][j].r*filtre[i][j];
            pixelFiltre.g += img[i][j].g*filtre[i][j];
            pixelFiltre.b += img[i][j].b*filtre[i][j];
        }
    }

	pixelFiltre.r = Math.min(255, Math.round(pixelFiltre.r));
	pixelFiltre.g = Math.min(255, Math.round(pixelFiltre.g));
	pixelFiltre.b = Math.min(255, Math.round(pixelFiltre.b));

    return pixelFiltre;
}


// Tests unitaires
function pixel2Str(pixel) {
    // Cette fonction converti un pixel en chaine de caractères pour les tests unitaires
    return ''+[pixel.r, pixel.g, pixel.b];
}

function imagesEgales(img1, img2) {
    // Cette function retourne vrai si les images fournies sont égales, c'est-à-dire
    // que chaque pixel est égal.
    
    if (img1.length != img2.length || img1.length[0] != img2.length[0])
        return false;
    
    for (var i = 0; i < img1.length; i++) {
    	for (var j = 0; j < img1[0].length; j++) {
        	if (pixel2Str(img1[i][j]) != pixel2Str(img2[i][j])) return false;
	    }
    }
   	return true;
}

function tests() {
    // Création d'images bidons pour tester les fonctions
	var pointBlanc = [[{r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}],
			[{r: 0, g: 0, b: 0}, {r: 255, g: 255, b: 255}, {r: 0, g: 0, b: 0}],
			[{r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}]];

    var voisinBlanc00 = [[{r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}],
			[{r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}],
			[{r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}, {r: 255, g: 255, b: 255}]];
    
    var flouBlanc3 = [[{r: 28, g: 28, b: 28}, {r: 28, g: 28, b: 28}, {r: 28, g: 28, b: 28}],
			[{r: 28, g: 28, b: 28}, {r: 28, g: 28, b: 28}, {r: 28, g: 28, b: 28}],
			[{r: 28, g: 28, b: 28}, {r: 28, g: 28, b: 28}, {r: 28, g: 28, b: 28}]];

	var pointNoir = [[{r: 255, g: 255, b: 255}, {r: 255, g: 255, b: 255}, {r: 255, g: 255, b: 255}],
			[{r: 255, g: 255, b: 255}, {r: 0, g: 0, b: 0}, {r: 255, g: 255, b: 255}],
			[{r: 255, g: 255, b: 255}, {r: 255, g: 255, b: 255}, {r: 255, g: 255, b: 255}]];
    
    var filtre = [[0.5, 0.5, 0.5],
                 [0.5, 0.5, 0.5],
                 [0.5, 0.5, 0.5]];
    
	var pointBlancFiltre = [[{r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}],
			[{r: 0, g: 0, b: 0}, {r: 128, g: 128, b: 128}, {r: 0, g: 0, b: 0}],
			[{r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}, {r: 0, g: 0, b: 0}]];

    
    // Fonctions pour tester l'égalité des pixels et des images
    assert(pixel2Str({r: 0, g: 0, b: 0}) == '0,0,0');
	assert(imagesEgales(pointBlanc, pointBlanc) == true);
	assert(imagesEgales(pointBlanc, pointNoir) == false);
    
    // Noir et blanc
    assert(luminance(pointBlanc[0][0]) == 0);
    assert(luminance({r: 100, g: 90, b: 80}) == 91);
    assert(imagesEgales(noirEtBlanc(pointBlanc), pointBlanc) == true);
        
    // Clarté
	assert(pixel2Str(modifierClarte({r: 100, g: 100, b: 100}, 1)) == pixel2Str({r: 100, g: 100, b: 100}));
	assert(pixel2Str(modifierClarte({r: 100, g: 100, b: 100}, 1.5)) == pixel2Str({r: 63, g: 63, b: 63}));
	assert(pixel2Str(modifierClarte({r: 100, g: 100, b: 100}, 0.5)) == pixel2Str({r: 160, g: 160, b: 160}));

    //Flou
    assert(imagesEgales(flou(pointBlanc, 3), flouBlanc3) == true);
    
    // Contour
    assert(imagesEgales(detectionContours(pointBlanc), pointNoir) == true);
    
    // Voisinage et filtre (moyenne pondérée)
    assert(imagesEgales(extractionVoisinage(pointBlanc, {x:0, y:0}, 3), voisinBlanc00) == true);
	assert(pixel2Str(appliquerFiltre(pointBlanc, filtre)) == pixel2Str({r:128, g:128, b:128}));
	assert(pixel2Str(appliquerFiltre(voisinBlanc00, filtre)) == pixel2Str({r:128, g:128, b:128}));
}


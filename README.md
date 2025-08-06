# Générateur de Mots de Passe PGN

Une application web qui convertit des fichiers PGN (Portable Game Notation) d'échecs en mots de passe sécurisés et déterministes.

## Fonctionnalités

- **Entrée PGN** : Collez n'importe quelle partie d'échecs au format PGN
- **Génération Sécurisée** : Utilise le hachage SHA-256 pour des mots de passe cryptographiquement sécurisés
- **Longueur Personnalisable** : Longueur de mot de passe ajustable (8-32 caractères)
- **Variété de Caractères** : Inclut majuscules, minuscules, chiffres et caractères spéciaux
- **Déterministe** : Le même PGN génère toujours le même mot de passe
- **Fonction de Copie** : Copie du mot de passe dans le presse-papiers en un clic

## Comment ça fonctionne

1. **Entrée** : Collez une partie d'échecs en notation PGN
2. **Traitement** : L'application supprime les métadonnées, commentaires et annotations du PGN
3. **Hachage** : Utilise SHA-256 pour créer un hash à partir de la séquence de coups nettoyée
4. **Génération** : Convertit le hash en un mot de passe sécurisé avec une variété de caractères garantie
5. **Sortie** : Affiche le mot de passe avec la fonctionnalité de copie

## Utilisation

1. Ouvrez `index.html` dans un navigateur web
2. Collez votre texte PGN dans la zone de texte
3. Ajustez la longueur du mot de passe avec le curseur (8-32 caractères)
4. Cliquez sur "Générer" pour créer votre mot de passe
5. Cliquez sur l'icône de copie pour copier le mot de passe dans le presse-papiers

## Détails Techniques

- **Algorithme** : Hachage SHA-256 avec sélection déterministe de caractères
- **Sécurité** : Assure au moins une majuscule, une minuscule, un chiffre et un caractère spécial
- **Compatibilité Navigateur** : Navigateurs modernes avec support de l'API Web Crypto
- **Aucune Dépendance** : HTML, CSS et JavaScript purs

## Structure des Fichiers

```
pgnPassword/
├── index.html          # Fichier principal de l'application
├── css/                # Feuilles de style
├── js/                 # Scripts JavaScript
├── assets/             # Ressources
└── README.md           # Cette documentation
```

## Exemple

PGN d'entrée :
```
1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6
```

Sortie : Un mot de passe unique et sécurisé basé sur cette séquence de coups.

## Note de Sécurité

Cet outil est conçu pour créer des mots de passe mémorables mais sécurisés à partir de parties d'échecs. Le même PGN produira toujours le même mot de passe, ce qui le rend utile pour créer des mots de passe cohérents à partir de parties mémorables.

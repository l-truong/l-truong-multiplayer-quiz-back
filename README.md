## V.0.1
```
- Préparation, mise en place et réflexion de la BDD, users stories, UX
- Création de compte MongoDB
```

## V.0.2
```
[BACK]
- Models categories et questions
- Routes api /categories
	GET 
	POST (+ bulk, csv) 
	UPDATE 
	DELETE
- Routes api /questions
	GET 
	POST (+ bulk, csv) 
	UPDATE 
	DELETE
- Test Unitaires
```

## V0.3
```
[FRONT]
- Jeu Solo
	categories
	jeu
	résultats
```

## V0.4
```
[BACK]
- Socket
	Jeu multijoueur
	Gestion des messages	
	Gestion des langues
[FRONT]
- Jeu multijoueur
	lobby
	pages
	categories
	jeu
	resultats	
	liste des joueurs
	chatbox
- Page accueil
- Routeurs
- Toasts
- Gestion des langues
```

## V0.5
```
[BACK]
- Refacto 
	env
	config
[FRONT]
- Refacto 
	mixins
	config
- Scss 
	bootstrap
	responsive
```

## V0.6
```
[BACK]
- Model room
- Sauvegarde des parties jouées sur MongoDb
- Hébergement
[FRONT]
- Hébergement
```

## V0.7
```
[BACK]
- Evolution des models
	ajout paramètre "image" au model questions (url Unsplash)
- Evolution des api 
	/questions
- Evolution des test Unitaires
	POST
	UPDATE
[FRONT]
- Evolution Solo et Multijoueur
	jeu: ajouter les images question.images
```

## > V1
```
-env
-hébergement
```

## V1.1
```
- Docker
```

## V1.2
```
[BACK]
- Tests d'intégrations socket
```

## V1.3
```
[BACK]
- Evolution des models
	ajout paramètre "icon" au model categories
- Evolution des api 
	/categories
- Evolution des test Unitaires
	POST
	UPDATE
[FRONT]
- Evolution Solo et Multijoueur
	jeu: ajouter les icons aux categories et transformer checkbox en boutons
```

## V1.4
```
[BACK]
- Evolution Socket
- Evolution tests d'intégrations socket
[FRONT]
- Permettre à l'utilisateur de choisir une couleur pour le chat et une image de profil
```

## V1.5
```
[BACK]
- Evolution du model questions
	ajout paramètre "difficulté" [1 à 5]
- Evolution des api 
	GET
	POST
	UPDATE	
- Evolution des test Unitaires	
[FRONT]
- Evolution Solo et Multijoueur
	catégorie: ajouter des checkbox pour choisir la difficulté des questions
	resultats: calculer le score finale avec la difficulté de la question
```

## V1.6
```
[FRONT]
- Evolution Multijoueur
	ajouter une page 'stats' par questions
```

## V.2
```
[BACK]
- Evolution Socket
- Evolution tests d'intégrations socket
[FRONT]
- Rajouter un input description à la création d'une salle
- Rajouter un checkbox pour choisir si la salle est publique ou privé
- Permettre à n'importe qui de choisir une salle publique
	comportera l'id des rooms publiques + descriptions
- Permettre à l'admin de kick un utilisateur
```

## V.2.1
```
[BACK]
- Routes api /room
	GET
	UPDATE
	DELETE
[FRONT]
- Tableau des scores des dernières rooms
- Top tablea des scores
```

## V.3
```
[FRONT]
- Admin category and questions managements
```

## V.4
```
[BACK]
- Evolution Socket
- Evolution tests d'intégrations socket
[FRONT]
- Mode de jeu battle royal
	100 joueurs et 3 vies
```

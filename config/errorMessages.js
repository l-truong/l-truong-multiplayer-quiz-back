const ERROR_MESSAGES = {
  eng: {
    roomIdNotFound: "roomId not found",
    roomDoesNotExist: "Room does not exist",
    roomIsFull: "Room is full",    
    usernameNotFound: "Username not found",
    usernameAlreadyTaken: "Username already taken, please choose another one",    
    messageNotFound: "Message not found",
    quizParamsNotFound: "Quiz params not found",
    missingQuizParams: "Missing quiz params: ",
    languageNotFound: "Language not found",
    languageNotAllowed: "Language not allowed",
    gameAlreadyOutgoing: "Game already outgoing",
    savingRoomData: "Error saving room data"
  },
  fr: {
    usernameNotFound: "Nom d'utilisateur introuvable",
    roomIdNotFound: "roomId introuvable",
    roomDoesNotExist: "La salle n'existe pas",
    roomIsFull: "La salle est pleine",
    messageNotFound: "Message introuvable",
    quizParamsNotFound: "Paramètres du quiz introuvables",
    missingQuizParams: "Paramètres de quiz manquants: ",
    languageNotFound: "Langue introuvable",
    languageNotAllowed: "Langue non autorisée",
    usernameAlreadyTaken: "Le nom d'utilisateur est déjà pris, veuillez en choisir un autre",
    gameAlreadyOutgoing: "Jeu déjà en cours",
    savingRoomData: "Erreur lors de l'enregistrement des données"
  },
};

module.exports = {
  ERROR_MESSAGES
};
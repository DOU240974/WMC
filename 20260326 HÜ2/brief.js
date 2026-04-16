// Brief holen
function holeBrief(inhalt) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(inhalt);
        }, 1000);
    });
}

// Brief stempeln
function stempelBrief(brief) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(brief + " [Gestempelt]");
        }, 1000);
    });
}

// Brief versenden
function versendeBrief(brief) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(brief + " -> Versendet!");
        }, 1000);
    });
}

// Promise-Chaining
holeBrief("Hallo Welt")
    .then((brief) => stempelBrief(brief))
    .then((brief) => versendeBrief(brief))
    .then((fertigerBrief) => {
        console.log(fertigerBrief);
    })
    .catch((error) => {
        console.error("Fehler:", error);
    });
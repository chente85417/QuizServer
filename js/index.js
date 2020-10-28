
const firebase = require('firebase');
//Configuración de Firebase
var firebaseConfig = {
    apiKey: "AIzaSyCQhmw85lCcRf8YBCYifYxndXLvZ2JN7O0",
    authDomain: "quiztb-176c8.firebaseapp.com",
    databaseURL: "https://quiztb-176c8.firebaseio.com",
    projectId: "quiztb-176c8",
    storageBucket: "quiztb-176c8.appspot.com",
    messagingSenderId: "392590006895",
    appId: "1:392590006895:web:42b85c76d078a11cd88b9a"
};
//Inicialización de Firebase
firebase.initializeApp(firebaseConfig);

const http = require('http');

const puerto = 8888;

const servidor = http.createServer(function(request, response){
    response.writeHead(200, { 
        "Access-Control-Allow-Origin" : "*",
        'Access-Control-Allow-Headers' : '*',
        "Content-type" : "application/json"
    });
    if (request.url === '/title')
    {
        //Solicitud del título
        const promTitle = new Promise((resolve, reject) => {
            firebase.database().ref("title").on("value", (snapshot) => {
                resolve(snapshot.val());
            });
        })
        promTitle.then((res) => {
            response.write(JSON.stringify(res));
            response.end();
        });
    }//if
    else if (request.url === '/questions')
    {
        //Solicitud de las preguntas
        const promQuestions = new Promise((resolve, reject) => {
            firebase.database().ref("questions").on('value', (dataSnapshot) => {
                resolve(dataSnapshot.val());
            })
        });
        promQuestions.then((res) => {
            response.write(JSON.stringify(res));
            response.end();
        });
    }//else if
    else if (request.url === '/questionsCount')
    {
        //Solicitud del número de preguntas existentes
        const promQuestionsCount = new Promise((resolve, reject) => {
            firebase.database().ref("questionsCount").once("value").then((snapshot) => {
                resolve(snapshot.val());
            })
        });
        promQuestionsCount.then((res) => {
            response.write(JSON.stringify(res));
            response.end();
        });
    }//else if
    else if (request.url === '/newQuestion')
    {        
        if (request.method === "POST")
        {
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', () => {
                let data = body.split('\"')[1].split('n')[1];
                //console.log(body);
                //console.log(data);
                firebase.database().ref("questions").update(JSON.parse(body));
                firebase.database().ref("questionsCount").set(data);
                response.end('ok');
            });
        }//if
        else {
            response.end();
        }
    }//else if
    else
    {
        //Solicitud no esperada
    }//else
})
servidor.listen(puerto);

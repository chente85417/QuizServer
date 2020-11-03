
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

const getRequest = (node) => {
    const prom = new Promise((resolve, reject) => {
        firebase.database().ref(node).on("value", (snapshot) => {
            resolve(snapshot.val());
        });
    });
    return prom;
}//getRequest

const servidor = http.createServer(function(request, response){
    response.writeHead(200, { 
        "Access-Control-Allow-Origin" : "*",
        'Access-Control-Allow-Headers' : '*',
        "Content-type" : "application/json"
    });

    switch (request.url)
    {
        case '/title'://Petición GET (título del cuestionario)
            {
                getRequest('/title').then((res) => {
                    response.write(JSON.stringify(res));
                    response.end();
                });
                break;
            }
        case '/questions'://Petición GET (colección de preguntas)
            {
                getRequest('/questions').then((res) => {
                    response.write(JSON.stringify(res));
                    response.end();
                });
                break;
            }
        case '/questionsCount'://Petición GET (número de preguntas existentes)
            {  
                getRequest('/questionsCount').then((res) => {
                    response.write(JSON.stringify(res));
                    response.end();
                });
                break;
            }
        case '/login'://Petición POST (credenciales)
            {
                if (request.method === "POST")
                {
                    console.log('llamada POST');
                    let body = '';
                    request.on('data', chunk => {
                        body += chunk.toString();
                    });
                    request.on('end', () => {
                        //Got credentials from front
                        const credentials = JSON.parse(body);
                        console.log(credentials);
                        //Get user from db
                        const prom = new Promise((resolve, reject) => {
                            firebase.database().ref('/user').on("value", (snapshot) => {
                                resolve(snapshot.val());
                            });
                        })
                        prom.then((res) => {
                            if (res === credentials.user)
                            {
                                console.log(`${res}; ${credentials.user}`);
                                //User email matches
                                //Now check out the password
                                const prom = new Promise((resolve, reject) => {
                                    firebase.database().ref('/pass').on("value", (snapshot) => {
                                        resolve(snapshot.val());
                                    });
                                })
                                prom.then((res) => {
                                    if (res === credentials.pass)
                                    {
                                        console.log(`${res}; ${credentials.pass}`);
                                        //Password matches
                                        response.end('1');
                                    }//if
                                    else
                                    {
                                        response.end('0');
                                    }//else
                                });
                            }//if
                            else
                            {
                                response.end('0');
                            }//else
                        });
                    });
                }//if
                else {
                    response.end('-1');
                }
                break;
            }
        case '/newQuestion'://Petición POST (inserción de nueva pregunta)
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
                break;
            }
        default:
            {
                //Solicitud no esperada
            }
    }//switch
})
servidor.listen(puerto);

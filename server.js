require('dotenv').config(); 

const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errorHandle = require("./errorHandle");

const PORT = process.env.PORT||3005;

// Mock data
// const todos = [{
//   "title":"今天樂活",
//   "id":uuidv4()
// }];

const todos = [];

// Create a local server to receive data from
const reqListener = (req, res) => {
  const httpHeader = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET, OPTIONS, DELETE",
    "Content-Type": "application/json",
  };

  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url === "/todos" && req.method === "GET") {
    res.writeHead(200, httpHeader);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    res.end();
  } else if (req.url === "/todos" && req.method === "POST") {
    req.on("end", () => {
      try {
        // parse input todo data
        const title = JSON.parse(body).title;

        // process(add) todo data
        if (title !== undefined) {
          const todo = {
            title,
            id: uuidv4(),
          };

          todos.push(todo);

          // response with all todo data
          res.writeHead(200, httpHeader);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
            })
          );
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res);
      }
    });
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, httpHeader);
    res.end();
  } else if (req.url === "/todos" && req.method === "DELETE") {
    //process(clear all) todo data
    todos.length = 0;

    // response with all todo data
    res.writeHead(200, httpHeader);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    res.end();
  } else if (req.url.startsWith("/todos") && req.method === "DELETE") {
    // parse input query todo-id
    const todoId = req.url.split("/").pop();

    // search todo-id for update
    const delIdx = todos.findIndex((todo) => todo.id === todoId);

    if (delIdx !== -1) {
      // process(remove) todo data
      todos.splice(delIdx, 1);

      // response with all todo data
      res.writeHead(200, httpHeader);
      res.write(
        JSON.stringify({
          status: "success",
          data: todos,
        })
      );
      res.end();
    } else {
      errorHandle(res);
    }
  } else if (req.url.startsWith("/todos") && req.method === "PATCH") {
    req.on("end", () => {
      // parse input query todo-id
      const todoId = req.url.split("/").pop();

      try {
        // parse input todo data
        const title = JSON.parse(body).title;

        // search todo-id for update
        const updIdx = todos.findIndex((todo) => todo.id === todoId);

        if (updIdx !== -1 && title !== undefined) {
          // process(update) todo data
          todos[updIdx].title = title;

          // response with all todo data
          res.writeHead(200, httpHeader);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
            })
          );
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res);
      }
    });
  } else {
    res.writeHead(400, httpHeader);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此網站路由",
      })
    );
    res.end();
  }
};

// start server on port 3005
const server = http.createServer(reqListener);
server.listen(PORT);

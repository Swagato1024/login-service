const http = require("node:http");
const fs = require("fs");

const isLoggedIn = (req) => req.cookies.username;

const serveHomePage = (request, response) => {
  if (!isLoggedIn(request)) {
    response.writeHead(303, { location: "/login" });
    response.end();
    return;
  }

  response.setHeader("content-type", "text/html");
  response.end(`Hello ${request.cookies.username}`);
};

const serveLoginPage = (request, response) => {
  if (isLoggedIn(request)) {
    response.writeHead(303, { location: "/" });
    response.end();
    return;
  }

  fs.readFile("./login.html", "utf-8", (err, content) => {
    response.setHeader("content-type", "text/html");
    response.end(content);
  });
};

const handleLogin = (request, response) => {
  let requestBody = "";

  request.on("data", (data) => (requestBody += data));

  request.on("end", () => {
    response.setHeader("Set-Cookie", requestBody);
    response.writeHead(302, { "location": "/", "Set-Cookie": requestBody });
    response.end();
  });
};

// key=value; key=value

const parseCookies = (request) => {
  // console.log(request.headers.coo)
  if (!request.headers.cookie) return {};

  const { cookie } = request.headers;
  const keyValuePairs = cookie.split("; ").map((kv) => kv.split("="));
  return Object.fromEntries(keyValuePairs);
};

const handleRequest = (request, response) => {
  const cookies = parseCookies(request);
  request.cookies = cookies;

  const { url, method } = request;
  console.log(url, method);

  if (url === "/") {
    serveHomePage(request, response);
    return;
  }

  if (url === "/login" && method === "GET") {
    serveLoginPage(request, response);
    return;
  }

  if (url === "/login" && method === "POST") {
    handleLogin(request, response);
    return;
  }

  response.end("not found");
};

const main = () => {
  const sever = http.createServer(handleRequest);

  sever.listen(8001, () => console.log("listening on port", 8001));
};

main();
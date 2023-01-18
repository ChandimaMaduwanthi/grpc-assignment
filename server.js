const PROTO_PATH = "./todos.proto";

var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var todoProto = grpc.loadPackageDefinition(packageDefinition);

const { v4: uuidv4 } = require("uuid");

const server = new grpc.Server();
const todos = [
    {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Do homework",
        description: "Finish homework before tomorrow"    
    },
    {
        id: "123e4567-e89b-12d3-a456-426614174001",
        title: "Clean room",
        description: "Clean the bedroom"
    }
];

server.addService(todoProto.TodoService.service, {
    getAll: (_, callback) => {
        callback(null, { todos });
    },

    get: (call, callback) => {
        let todo = todos.find(n => n.id == call.request.id);

        if (todo) {
            callback(null, todo);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    },

    insert: (call, callback) => {
        let todo = call.request;
        
        todo.id = uuidv4();
        todos.push(todo);
        callback(null, todo);
    },

    update: (call, callback) => {
        let existingTodo = todos.find(n => n.id == call.request.id);

        if (existingTodo) {
            existingTodo.title = call.request.title;
            existingTodo.description = call.request.description;
            callback(null, existingTodo);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    },

    remove: (call, callback) => {
        let existingTodoIndex = todos.findIndex(
            n => n.id == call.request.id
        );

        if (existingTodoIndex != -1) {
            todos.splice(existingTodoIndex, 1);
            callback(null, {});
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    }
});

server.bind("127.0.0.1:30000", grpc.ServerCredentials.createInsecure());
console.log("Server running at http://127.0.0.1:30000");
server.start();
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = findAll;
exports.findOne = findOne;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.login = login;
const usuario_repository_1 = require("../repositories/usuario.repository");
const usuario_model_1 = require("../models/usuario.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const repository = new usuario_repository_1.UsuarioRepository();
async function findAll(req, res) {
    try {
        const usuarios = await repository.findAll();
        res.json(usuarios);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', errorMessage: error.message });
    }
}
async function findOne(req, res) {
    try {
        const id = Number(req.params.id);
        const usuario = await repository.findOne({ id: id.toString() });
        if (usuario) {
            res.json(usuario);
        }
        else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario', errorMessage: error.message });
    }
}
async function create(req, res) {
    try {
        const { contrasena, ...rest } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(contrasena, 10);
        const usuario = new usuario_model_1.Usuario(rest.id_usuario, rest.nombre, rest.apellido, rest.username, hashedPassword);
        const result = await repository.save(usuario);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al crear el usuario', errorMessage: error.message });
    }
}
async function update(req, res) {
    try {
        const { id } = req.params;
        let { contrasena } = req.body;
        if (!contrasena.startsWith('$2b$')) {
            contrasena = await bcrypt_1.default.hash(contrasena, 10);
        }
        const usuarioActualizado = new usuario_model_1.Usuario(Number(id), req.body.nombre, req.body.apellido, req.body.username, contrasena);
        const result = await repository.update({ id: id }, usuarioActualizado);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario', errorMessage: error.message });
    }
}
async function remove(req, res) {
    try {
        const { id } = req.params;
        await repository.remove({ id: id });
        res.json({ message: 'Usuario eliminado' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', errorMessage: error.message });
    }
}
async function login(req, res) {
    try {
        const { username, password } = req.body;
        const usuario = await repository.findByUsername(username);
        if (usuario) {
            const isMatch = await bcrypt_1.default.compare(password, usuario.contrasena);
            if (isMatch) {
                const token = jsonwebtoken_1.default.sign({ id_usuario: usuario.id_usuario, username: usuario.username }, 'secreto_del_token', { expiresIn: '1h' });
                res.json({ usuario, token });
            }
            else {
                res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }
        }
        else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', errorMessage: error.message });
    }
}

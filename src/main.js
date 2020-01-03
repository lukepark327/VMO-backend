"use strict";
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const nw = require("./network");
const wl = require("./wallet");
const ut = require("./utils");

const http_port = process.env.HTTP_PORT || 3001;
const initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

function initHttpServer() {
    const bc = require("./blockchain");

    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    app.get("/blocks", function (req, res) {
        res.send(bc.getBlockchain());
    });
    app.get('/block/:number', function (req, res) {
        const targetBlock = bc.getBlockchain().find(function (block) {
            return block.header.index == req.params.number;
        });
        res.send(targetBlock);
    });
    app.post("/mineBlock", function (req, res) {
        const category = req.body.category || "general";
        const data = req.body.data || [];
        const newBlock = bc.mineBlock(category, data);
        if (newBlock === null) {
            res.status(400).send('Bad Request');
        }
        else {
            res.send(newBlock);
        }
    });
    app.get('/category/:filter', function (req, res) {
        const targetBlocks = bc.getBlockchain().filter(function (block) {
            return block.category == req.params.filter;
        });
        res.send(targetBlocks);
    });
    app.get("/version", function (req, res) {
        res.send(ut.getCurrentVersion());
    });
    app.get("/blockVersion/:number", function (req, res) {
        const targetBlock = bc.getBlockchain().find(function (block) {
            return block.header.index == req.params.number;
        });
        res.send(targetBlock.header.version);
    });
    app.get("/peers", function (req, res) {
        res.send(nw.getSockets().map(function (s) {
            return s._socket.remoteAddress + ':' + s._socket.remotePort;
        }));
    });
    app.post("/addPeers", function (req, res) {
        const peers = req.body.peers || [];
        nw.connectToPeers(peers);
        res.send();
    });
    app.get("/address", function (req, res) {
        const address = wl.getPublicFromWallet().toString();
        res.send({ "address": address });
    });
    app.post("/stop", function (req, res) {
        res.send({ "msg": "Stopping server" });
        process.exit();
    });

    app.listen(http_port, function () { console.log("Listening http port on: " + http_port) });
}

// main
nw.connectToPeers(initialPeers);
initHttpServer();
nw.initP2PServer();
wl.initWallet();

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const client_1 = __importDefault(require("@bundlr-network/client"));
require('dotenv').config();
const getTransactionPrice = (fileSize, bundlr) => __awaiter(void 0, void 0, void 0, function* () {
    let [err, price] = [null, null];
    if (fileSize <= 0 || isNaN(fileSize)) {
        err = "incorrect file size format";
    }
    else {
        const price1MBAtomic = yield bundlr.getPrice(fileSize);
        price = bundlr.utils.unitConverter(price1MBAtomic);
    }
    return [err, price];
});
const processTransactions = (bundlr) => {
};
const fundNode = (bundlr, price) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // response = {
        //  id, // the txID of the fund transfer
        //  quantity, // how much is being transferred
        //  reward, // the amount taken by the network as a fee
        //  target, // the address the funds were sent to
        // };
        let response = yield bundlr.fund(price);
        console.log(`Funding successful txID=${response.id} amount funded=${response.quantity}`);
        return [null, response];
    }
    catch (e) {
        console.log("Error funding node ", e);
        return [e, null];
    }
});
const upload = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const bundlr = new client_1.default("https://devnet.bundlr.network", "solana", process.env.PHANTOM_PRIVATE_KEY, {
        providerUrl: "https://api.devnet.solana.com"
    });
    const dataSizeToCheck = 1; // temp remove this later 
    const [err, price] = yield getTransactionPrice(dataSizeToCheck, bundlr);
    if (err !== null) {
        let [fundError, fundResponse] = yield fundNode(bundlr, price);
        if (fundError != null) {
            console.log(fundResponse);
        }
    }
});
exports.upload = upload;
// payload: {path: "pathToFile"}

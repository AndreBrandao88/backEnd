// API REST dos prestadores 
import express from "express"
import { connectToDatabase } from '../utils/mongodb.js'
import {check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'prestadores'
const {db, ObjectId } = await connectToDatabase()

/************************************
 * Validações
 */

const validaPrestador = [
    check('cnpj')
    .not().isEmpty().trim()
    .withMessage('É obrigatório informar o CNPJ')
    .isNumeric().withMessage('O CNPJ pode conter apenas números')
    .isLength({min:14, max:14})
    .withMessage('O tamanho do CNPJ é inválido')
    .custom((value, {req}) => {
        return db.collection(nomeCollection)
            .find({cnpj: { $eq: value} }).toArray()
            .then((cnpj)=> {
            //verificamos se não é update
            if(cnpj.lenght && !req.body._id){
                return Promise.reject(`O CNPJ ${value} já esta informado`)

            }

        })
    }),
    check('razao_social')
    .not().isEmpty().trim()
    .withMessage('É obrigatório informar a Razão Social')
    .isAlphanumeric ('pt-BR', {ignore: '/. '})
    .withMessage ('Existem caracteres inválidos no nome da Razão')
    .isLength({min:3}).withMessage ('A razão informada é muito curta')
    .isLength({ max: 100}).withMessage('A razão informada é muito longa'),
    check('cnae_fiscal')
    .isNumeric().withMessage('O CNAE deve ser um número'),
    check ('data_inicio_atividade')
    .optional({nullable: true})
    .isDate({ format: 'YYYY-MM-DD'})
    .withMessage('Informe uma data válida no padrão AAAA-MM-DD')
]

/*************************
 * POST/api/prestadores
 *************************/

router.post('/', validaPrestador,
async(req, res ) => {
    const erros = validationResult(req)

    //Existe algum erro na requisição?
    if(!erros.isEmpty()){
        return res.status(400).json({
            erros: erros.array()
        })
    } else {
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(201).send(result))
        .catch(err => res.status(400).json(err))

    }
})

/*************************
 * POUT/api/prestadores
 *************************/

 router.put('/', validaPrestador,
 async(req, res ) => {
    let idDocumento = req.body._id
    delete req.body._id
     const erros = validationResult(req)
 
     //Existe algum erro na requisição?
     if(!erros.isEmpty()){
         return res.status(400).json({
             erros: erros.array()
         })
     } else {
         await db.collection(nomeCollection)
         .updateOne({'_id': { $eq: ObjectId(idDocumento)}},
         { $set: req.body}
         )
         .then(result => res.status(201).send(result))
         .catch(err => res.status(400).json(err))
 
     }
 })




/*************************
 * GET /api/prestadores
 *************************/
 router.get('/', async(req, res) => {
    try {
        db.collection(nomeCollection).find({}, {}).sort({ razao_social: 1 })
            .toArray((err, docs) => {
                if (!err) { res.status(200).json(docs) }
            })
    } catch (err) {
        res.status(500).json({ errors: [{ msg: `Erro: ${err.message}` }] })
    }
})

/*********************************
* GET /api/prestadores/id/:id

*********************************/

router.get('/id/:id', async (req,res) => {
    try {
        db.collection(nomeCollection).find({"_id": {$eq: ObjectId(req.params.id)}}, {}).sort({ razao_social: 1})
        .toArray((err, docs) => {
            if (!err) { res.status(200).json(docs)}
        })
    } catch (err) {
        res.status(500).json({errors: [{msg: `Erro: ${err.message}`}] })
    }
})

/*********************************
* GET /api/prestadores/razao/:razao

*********************************/

router.get('/razao/:razao', async (req,res) => {
    try {
        db.collection(nomeCollection).find({"razao_social": {
                                                            $regex: req.params.razao, 
                                                            $options: "i"}
                                                            },                                                        {}).sort({ razao_social: 1})
        .toArray((err, docs) => {
            if (!err) { res.status(200).json(docs)}
        })
    } catch (err) {
        res.status(500).json({errors: [{msg: `Erro: ${err.message}`}] })
    }
})

/*********************************
* GET /api/prestadores/razao/:id

*********************************/

router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": {$eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router 